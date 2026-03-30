package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeOrderUpdate NotificationType = "ORDER_UPDATE"
	NotificationTypePayment     NotificationType = "PAYMENT"
	NotificationTypePromo       NotificationType = "PROMO"
	NotificationTypeSystem      NotificationType = "SYSTEM"
)

// NotificationPriority represents the priority level
type NotificationPriority string

const (
	NotificationPriorityLow    NotificationPriority = "LOW"
	NotificationPriorityNormal NotificationPriority = "NORMAL"
	NotificationPriorityHigh   NotificationPriority = "HIGH"
)

// UserRole represents the user role for notification targeting
type UserRole string

const (
	UserRoleUser  UserRole = "USER"
	UserRoleAdmin UserRole = "ADMIN"
)

// Notification represents a user notification
type Notification struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	UserID    string               `bson:"userId" json:"userId"`
	Role      UserRole             `bson:"role" json:"role"`
	Type      NotificationType     `bson:"type" json:"type"`
	Title     string               `bson:"title" json:"title"`
	Message   string               `bson:"message" json:"message"`
	Payload   map[string]any       `bson:"payload" json:"payload"` // fully dynamic
	IsRead    bool                 `bson:"isRead" json:"isRead"`
	Priority  NotificationPriority `bson:"priority" json:"priority"`
	CreatedAt time.Time            `bson:"createdAt" json:"createdAt"`
}

// CollectionName returns the MongoDB collection name
func (Notification) CollectionName() string {
	return "notifications"
}
