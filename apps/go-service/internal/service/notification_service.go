package service

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/shoptik/go-service/internal/model"
	"github.com/shoptik/go-service/internal/repository"
	pb "github.com/shoptik/go-service/pkg/proto/shoptik"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// NotificationServer implements the NotificationService gRPC server
type NotificationServer struct {
	pb.UnimplementedNotificationServiceServer
	repo *repository.Repository
	hub  *WebSocketHub
}

// NewNotificationServer creates a new NotificationServer
func NewNotificationServer(repo *repository.Repository, hub *WebSocketHub) *NotificationServer {
	return &NotificationServer{
		repo: repo,
		hub:  hub,
	}
}

// CreateNotification creates a new notification
func (s *NotificationServer) CreateNotification(ctx context.Context, req *pb.CreateNotificationRequest) (*pb.CreateNotificationResponse, error) {
	log.Printf("[NotificationServer] CreateNotification called for user: %s", req.GetUserId())

	// Convert map[string]string to map[string]any
	payload := make(map[string]any)
	for k, v := range req.GetPayload() {
		payload[k] = v
	}

	notification := &model.Notification{
		UserID:    req.GetUserId(),
		Role:      model.UserRole(req.GetRole()),
		Type:      model.NotificationType(req.GetType()),
		Title:     req.GetTitle(),
		Message:   req.GetMessage(),
		Payload:   payload,
		IsRead:    false,
		Priority:  model.NotificationPriority(req.GetPriority()),
		CreatedAt: time.Now(),
	}

	res, err := s.repo.Notifications.InsertOne(ctx, notification)
	if err != nil {
		log.Printf("[NotificationServer] Error inserting notification: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to create notification: %v", err)
	}

	notification.ID = res.InsertedID.(primitive.ObjectID)
	log.Printf("[NotificationServer] Created notification with ID: %s", notification.ID.Hex())

	// NOTE: Do NOT broadcast here. Redis subscriber already handles broadcasting
	// via WebSocket when NestJS publishes to Redis Pub/Sub. Broadcasting here
	// would cause every notification to be delivered twice.

	return &pb.CreateNotificationResponse{
		Notification: toProtoNotification(notification),
	}, nil
}

// ListUserNotifications lists notifications for a user
func (s *NotificationServer) ListUserNotifications(ctx context.Context, req *pb.ListUserNotificationsRequest) (*pb.ListUserNotificationsResponse, error) {
	log.Printf("[NotificationServer] ListUserNotifications called for user: %s", req.GetUserId())

	page := int(req.GetPage())
	if page < 1 {
		page = 1
	}
	limit := int(req.GetLimit())
	if limit < 1 {
		limit = 20
	}
	skip := (page - 1) * limit

	// Get total count
	total, err := s.repo.Notifications.CountDocuments(ctx, bson.M{"userId": req.GetUserId()})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count notifications: %v", err)
	}

	// Get unread count
	unreadCount, err := s.repo.Notifications.CountDocuments(ctx, bson.M{
		"userId": req.GetUserId(),
		"isRead": false,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count unread notifications: %v", err)
	}

	// Get paginated results
	findOpts := options.Find().
		SetSort(bson.M{"createdAt": -1}).
		SetSkip(int64(skip)).
		SetLimit(int64(limit))

	cursor, err := s.repo.Notifications.Find(ctx, bson.M{"userId": req.GetUserId()}, findOpts)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list notifications: %v", err)
	}
	defer cursor.Close(ctx)

	var notifications []*model.Notification
	if err := cursor.All(ctx, &notifications); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to decode notifications: %v", err)
	}

	var protoNotifications []*pb.Notification
	for _, n := range notifications {
		protoNotifications = append(protoNotifications, toProtoNotification(n))
	}

	return &pb.ListUserNotificationsResponse{
		Notifications: protoNotifications,
		Total:         int32(total),
		Page:          int32(page),
		Limit:         int32(limit),
		UnreadCount:   int32(unreadCount),
	}, nil
}

// GetUnreadCount gets unread notification count
func (s *NotificationServer) GetUnreadCount(ctx context.Context, req *pb.GetUnreadCountRequest) (*pb.GetUnreadCountResponse, error) {
	count, err := s.repo.Notifications.CountDocuments(ctx, bson.M{
		"userId": req.GetUserId(),
		"isRead": false,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count unread notifications: %v", err)
	}

	return &pb.GetUnreadCountResponse{
		Count: int32(count),
	}, nil
}

// MarkAsRead marks a notification as read
func (s *NotificationServer) MarkAsRead(ctx context.Context, req *pb.MarkAsReadRequest) (*pb.MarkAsReadResponse, error) {
	id, err := primitive.ObjectIDFromHex(req.GetNotificationId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid notification id: %v", err)
	}

	res, err := s.repo.Notifications.UpdateOne(ctx,
		bson.M{"_id": id, "userId": req.GetUserId()},
		bson.M{"$set": bson.M{"isRead": true}},
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to mark notification as read: %v", err)
	}

	if res.MatchedCount == 0 {
		return nil, status.Errorf(codes.NotFound, "notification not found")
	}

	return &pb.MarkAsReadResponse{Success: true}, nil
}

// MarkAllAsRead marks all notifications as read
func (s *NotificationServer) MarkAllAsRead(ctx context.Context, req *pb.MarkAllAsReadRequest) (*pb.MarkAllAsReadResponse, error) {
	res, err := s.repo.Notifications.UpdateMany(ctx,
		bson.M{"userId": req.GetUserId(), "isRead": false},
		bson.M{"$set": bson.M{"isRead": true}},
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to mark all notifications as read: %v", err)
	}

	return &pb.MarkAllAsReadResponse{
		Success:      true,
		MarkedCount:  int32(res.ModifiedCount),
	}, nil
}

// toProtoNotification converts a model.Notification to proto Notification
func toProtoNotification(n *model.Notification) *pb.Notification {
	payload := make(map[string]string)
	if n.Payload != nil {
		for k, v := range n.Payload {
			if str, ok := v.(string); ok {
				payload[k] = str
			} else {
				// Convert non-string values to JSON string
				if jsonBytes, err := json.Marshal(v); err == nil {
					payload[k] = string(jsonBytes)
				}
			}
		}
	}

	return &pb.Notification{
		Id:        n.ID.Hex(),
		UserId:    n.UserID,
		Role:      string(n.Role),
		Type:      string(n.Type),
		Title:     n.Title,
		Message:   n.Message,
		Payload:   payload,
		IsRead:    n.IsRead,
		Priority:  string(n.Priority),
		CreatedAt: n.CreatedAt.Format(time.RFC3339),
	}
}
