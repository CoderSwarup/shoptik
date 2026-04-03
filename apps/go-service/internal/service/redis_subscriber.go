package service

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/shoptik/go-service/internal/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RedisSubscriber subscribes to Redis Pub/Sub and broadcasts to WebSocket
type RedisSubscriber struct {
	client *redis.Client
	hub    *WebSocketHub
	ctx    context.Context
	cancel context.CancelFunc
}

// NotificationMessage represents a notification from Redis
type NotificationMessage struct {
	UserID    string                 `json:"userId"`
	Role      string                 `json:"role"`
	Type      string                 `json:"type"`
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Payload   map[string]interface{} `json:"payload"`
	Priority  string                 `json:"priority"`
	Timestamp string                 `json:"timestamp"`
}

// NewRedisSubscriber creates a new RedisSubscriber
func NewRedisSubscriber(redisURL string, hub *WebSocketHub) *RedisSubscriber {
	var client *redis.Client

	if redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Printf("[RedisSubscriber] Failed to parse Redis URL: %v", err)
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

	return &RedisSubscriber{
		client: client,
		hub:    hub,
		ctx:    ctx,
		cancel: cancel,
	}
}

// Start starts the Redis subscriber
func (r *RedisSubscriber) Start() {
	log.Println("[RedisSubscriber] Starting...")

	// Subscribe to channels
	pubsub := r.client.Subscribe(r.ctx, "notifications:all", "notifications:admin")

	// Wait for confirmation
	_, err := pubsub.Receive(r.ctx)
	if err != nil {
		log.Printf("[RedisSubscriber] Subscribe error: %v", err)
		return
	}

	// Start goroutine to handle messages
	go func() {
		ch := pubsub.Channel()
		for msg := range ch {
			r.handleMessage(msg)
		}
	}()

	// Subscribe to user-specific channels dynamically
	go r.subscribeUserChannels()

	log.Println("[RedisSubscriber] Started successfully")
}

// Stop stops the Redis subscriber
func (r *RedisSubscriber) Stop() {
	r.cancel()
	r.client.Close()
	log.Println("[RedisSubscriber] Stopped")
}

// handleMessage handles incoming Redis messages
func (r *RedisSubscriber) handleMessage(msg *redis.Message) {
	log.Printf("[RedisSubscriber] Received message on channel: %s", msg.Channel)

	var notifMsg NotificationMessage
	if err := json.Unmarshal([]byte(msg.Payload), &notifMsg); err != nil {
		log.Printf("[RedisSubscriber] Failed to unmarshal message: %v", err)
		return
	}

	// Convert to model.Notification
	notification := &model.Notification{
		ID:        primitive.NewObjectID(),
		UserID:    notifMsg.UserID,
		Role:      model.UserRole(notifMsg.Role),
		Type:      model.NotificationType(notifMsg.Type),
		Title:     notifMsg.Title,
		Message:   notifMsg.Message,
		Payload:   notifMsg.Payload,
		IsRead:    false,
		Priority:  model.NotificationPriority(notifMsg.Priority),
		CreatedAt: time.Now(),
	}

	// Broadcast to WebSocket clients
	r.hub.Broadcast(notification)
}

// subscribeUserChannels subscribes to user-specific channels
func (r *RedisSubscriber) subscribeUserChannels() {
	// In a real implementation, you might want to dynamically subscribe
	// to user channels based on active WebSocket connections
	// For now, we'll just log that we're ready
	log.Println("[RedisSubscriber] Ready to subscribe to user-specific channels")
}
