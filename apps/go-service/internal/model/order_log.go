package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// OrderLogStatus represents the status of an order log entry
type OrderLogStatus string

const (
	OrderLogStatusReceived   OrderLogStatus = "RECEIVED"
	OrderLogStatusProcessing OrderLogStatus = "PROCESSING"
	OrderLogStatusShipped    OrderLogStatus = "SHIPPED"
	OrderLogStatusFailed     OrderLogStatus = "FAILED"
)

// OrderLogSource represents where the log originated
type OrderLogSource string

const (
	OrderLogSourceWorker OrderLogSource = "WORKER"
	OrderLogSourceSystem OrderLogSource = "SYSTEM"
	OrderLogSourceAPI    OrderLogSource = "API"
)

// OrderLog represents a log entry for order processing
type OrderLog struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderID   string             `bson:"orderId" json:"orderId"`
	UserID    string             `bson:"userId" json:"userId"`
	Status    OrderLogStatus     `bson:"status" json:"status"`
	Message   string             `bson:"message" json:"message"`
	Source    OrderLogSource     `bson:"source" json:"source"`
	Metadata  OrderLogMetadata   `bson:"metadata" json:"metadata"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

// OrderLogMetadata contains additional metadata for the log entry
type OrderLogMetadata struct {
	Step     string `bson:"step,omitempty" json:"step,omitempty"`
	WorkerID string `bson:"workerId,omitempty" json:"workerId,omitempty"`
}

// CollectionName returns the MongoDB collection name
func (OrderLog) CollectionName() string {
	return "order_logs"
}
