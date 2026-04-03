package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// OrderLogEventType represents the type of order event
type OrderLogEventType string

const (
	OrderLogEventOrderCreated      OrderLogEventType = "ORDER_CREATED"
	OrderLogEventPaymentPending    OrderLogEventType = "PAYMENT_PENDING"
	OrderLogEventPaymentSuccess    OrderLogEventType = "PAYMENT_SUCCESS"
	OrderLogEventPaymentFailed     OrderLogEventType = "PAYMENT_FAILED"
	OrderLogEventStatusChanged     OrderLogEventType = "STATUS_CHANGED"
	OrderLogEventOrderCancelled    OrderLogEventType = "ORDER_CANCELLED"
	OrderLogEventAddressValidated  OrderLogEventType = "ADDRESS_VALIDATED"
)

// OrderLog represents a log entry for order events (for admin audit trail)
type OrderLog struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	OrderID   string              `bson:"orderId" json:"orderId"`
	UserID    string              `bson:"userId" json:"userId"`
	EventType OrderLogEventType   `bson:"eventType" json:"eventType"`
	Title     string              `bson:"title" json:"title"`
	Message   string              `bson:"message" json:"message"`
	Metadata  map[string]any      `bson:"metadata,omitempty" json:"metadata,omitempty"`
	Timestamp time.Time           `bson:"timestamp" json:"timestamp"`
	CreatedAt time.Time           `bson:"createdAt" json:"createdAt"` // When log was stored
}

// CollectionName returns the MongoDB collection name
func (OrderLog) CollectionName() string {
	return "order_logs"
}
