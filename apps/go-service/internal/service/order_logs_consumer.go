package service

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/shoptik/go-service/internal/model"
	"github.com/shoptik/go-service/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// OrderLogData represents order log data from BullMQ queue
type OrderLogData struct {
	OrderID   string         `json:"orderId"`
	UserID    string         `json:"userId"`
	EventType string         `json:"eventType"`
	Title     string         `json:"title"`
	Message   string         `json:"message"`
	Metadata  map[string]any `json:"metadata,omitempty"`
	Timestamp string         `json:"timestamp"`
}

// OrderLogsConsumer consumes order logs from BullMQ queue and stores in MongoDB
type OrderLogsConsumer struct {
	client     *redis.Client
	repo       *repository.Repository
	ctx        context.Context
	cancel     context.CancelFunc
	batchSize  int
	batchDelay time.Duration
	batch      []model.OrderLog
	lastID     string
}

// NewOrderLogsConsumer creates a new OrderLogsConsumer
func NewOrderLogsConsumer(redisURL string, repo *repository.Repository) *OrderLogsConsumer {
	var client *redis.Client

	if redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Printf("[OrderLogsConsumer] Failed to parse Redis URL: %v", err)
			client = redis.NewClient(&redis.Options{
				Addr: "localhost:6379",
			})
		} else {
			client = redis.NewClient(opt)
		}
	} else {
		client = redis.NewClient(&redis.Options{
			Addr: "localhost:6379",
		})
	}

	ctx, cancel := context.WithCancel(context.Background())

	// Load last processed ID from Redis (if exists)
	lastID, err := client.Get(ctx, "order-logs:cursor").Result()
	if err == redis.Nil {
		lastID = "$" // Start from latest if no cursor saved
	} else if err != nil {
		log.Printf("[OrderLogsConsumer] Error loading cursor: %v", err)
		lastID = "$"
	}

	return &OrderLogsConsumer{
		client:     client,
		repo:       repo,
		ctx:        ctx,
		cancel:     cancel,
		batchSize:  50,        // Batch insert after 50 logs
		batchDelay: 2 * time.Second, // Or every 2 seconds
		batch:      make([]model.OrderLog, 0),
		lastID:     lastID,
	}
}

// Start starts the BullMQ consumer
func (c *OrderLogsConsumer) Start() {
	log.Println("[OrderLogsConsumer] Starting...")
	log.Printf("[OrderLogsConsumer] Will read from stream: order-logs:events")

	// Start goroutine to consume from BullMQ queue
	go c.consumeFromQueue()

	// Start goroutine to flush batches periodically
	go c.batchFlushLoop()

	log.Println("[OrderLogsConsumer] Started successfully")
}

// Stop stops the consumer
func (c *OrderLogsConsumer) Stop() {
	c.flushBatch() // Flush remaining logs
	
	// Save last processed cursor
	if c.lastID != "" && c.lastID != "$" {
		c.client.Set(c.ctx, "order-logs:cursor", c.lastID, 0)
		log.Printf("[OrderLogsConsumer] Saved cursor: %s", c.lastID)
	}
	
	c.cancel()
	c.client.Close()
	log.Println("[OrderLogsConsumer] Stopped")
}

// consumeFromQueue reads from BullMQ Redis stream
func (c *OrderLogsConsumer) consumeFromQueue() {
	// BullMQ with streams option creates: {queueName}:events
	streamKey := "order-logs:events"

	for {
		select {
		case <-c.ctx.Done():
			return
		default:
			// Read from stream starting from last processed ID
			result, err := c.client.XRead(c.ctx, &redis.XReadArgs{
				Streams: []string{streamKey, c.lastID},
				Count:   10,
				Block:   5 * time.Second,
			}).Result()

			if err != nil {
				if err == redis.Nil {
					continue // No new messages
				}
				log.Printf("[OrderLogsConsumer] Stream read error: %v", err)
				time.Sleep(1 * time.Second)
				continue
			}

			if len(result) == 0 || len(result[0].Messages) == 0 {
				continue
			}

			// Process messages
			for _, msg := range result[0].Messages {
				c.lastID = msg.ID // Update last processed ID

				// Save cursor to Redis every 10 messages (for recovery)
				if msg.ID[len(msg.ID)-1] == '0' || msg.ID[len(msg.ID)-1] == '5' {
					c.client.Set(c.ctx, "order-logs:cursor", c.lastID, 0)
				}

				// BullMQ stream message format: field "data" contains JSON string
				dataStr, ok := msg.Values["data"].(string)
				if !ok {
					// Try alternate format - sometimes stored as msgpack or direct JSON
					log.Printf("[OrderLogsConsumer] Message format: %+v", msg.Values)
					continue
				}

				var logData OrderLogData
				if err := json.Unmarshal([]byte(dataStr), &logData); err != nil {
					log.Printf("[OrderLogsConsumer] Failed to unmarshal job data: %v", err)
					continue
				}

				// Create order log entry
				orderLog := model.OrderLog{
					ID:        primitive.NewObjectID(),
					OrderID:   logData.OrderID,
					UserID:    logData.UserID,
					EventType: model.OrderLogEventType(logData.EventType),
					Title:     logData.Title,
					Message:   logData.Message,
					Metadata:  logData.Metadata,
					Timestamp: time.Now(),
					CreatedAt: time.Now(),
				}

				// Add to batch
				c.batch = append(c.batch, orderLog)
				log.Printf("[OrderLogsConsumer] Queued log: %s - %s", orderLog.OrderID, orderLog.EventType)

				// Flush if batch is full
				if len(c.batch) >= c.batchSize {
					c.flushBatch()
				}
			}
		}
	}
}

// batchFlushLoop periodically flushes the batch
func (c *OrderLogsConsumer) batchFlushLoop() {
	ticker := time.NewTicker(c.batchDelay)
	defer ticker.Stop()

	for {
		select {
		case <-c.ctx.Done():
			return
		case <-ticker.C:
			c.flushBatch()
		}
	}
}

// flushBatch inserts the current batch into MongoDB
func (c *OrderLogsConsumer) flushBatch() {
	if len(c.batch) == 0 {
		return
	}

	log.Printf("[OrderLogsConsumer] Flushing batch of %d logs", len(c.batch))

	// Convert to interface slice for InsertMany
	docs := make([]interface{}, len(c.batch))
	for i, log := range c.batch {
		docs[i] = log
	}

	// Bulk insert
	_, err := c.repo.OrderLogs.InsertMany(c.ctx, docs)
	if err != nil {
		log.Printf("[OrderLogsConsumer] Failed to insert batch: %v", err)
		// Don't clear batch on error - will retry next flush
		return
	}

	log.Printf("[OrderLogsConsumer] Flushed %d logs to MongoDB", len(c.batch))
	c.batch = make([]model.OrderLog, 0, c.batchSize)
}
