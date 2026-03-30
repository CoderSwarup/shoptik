package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// DeliveryZone represents a serviceable delivery area
type DeliveryZone struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Pincode        string             `bson:"pincode" json:"pincode"`
	City           string             `bson:"city" json:"city"`
	State          string             `bson:"state" json:"state"`
	IsServiceable  bool               `bson:"isServiceable" json:"isServiceable"`
	ETADays        int                `bson:"etaDays" json:"etaDays"`
	DeliveryCharge float64            `bson:"deliveryCharge" json:"deliveryCharge"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
}

// CollectionName returns the MongoDB collection name
func (DeliveryZone) CollectionName() string {
	return "delivery_zones"
}
