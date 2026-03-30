package repository

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/shoptik/go-service/internal/config"
	"github.com/shoptik/go-service/internal/model"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Repository provides access to MongoDB collections
type Repository struct {
	client   *mongo.Client
	database *mongo.Database

	// Collections
	OrderLogs      *mongo.Collection
	DeliveryZones  *mongo.Collection
	Notifications  *mongo.Collection
}

// New creates a new MongoDB repository
func New(cfg *config.Config) (*Repository, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB
	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Ping to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	log.Printf("[repository] connected to MongoDB: %s", cfg.MongoDB)

	db := client.Database(cfg.MongoDB)

	return &Repository{
		client:        client,
		database:      db,
		OrderLogs:     db.Collection(model.OrderLog{}.CollectionName()),
		DeliveryZones: db.Collection(model.DeliveryZone{}.CollectionName()),
		Notifications: db.Collection(model.Notification{}.CollectionName()),
	}, nil
}

// Close closes the MongoDB connection
func (r *Repository) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return r.client.Disconnect(ctx)
}

// Ping checks if the database is reachable
func (r *Repository) Ping(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	return r.client.Ping(ctx, nil)
}

// Health returns database health information
func (r *Repository) Health(ctx context.Context) map[string]any {
	start := time.Now()
	err := r.Ping(ctx)
	latency := time.Since(start).Milliseconds()

	result := map[string]any{
		"database":  "MongoDB",
		"connected": err == nil,
		"latencyMs": latency,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	if err != nil {
		result["status"] = "error"
		result["error"] = err.Error()
	} else {
		result["status"] = "ok"
		result["collections"] = []string{
			"order_logs",
			"delivery_zones",
			"notifications",
		}
	}

	return result
}
