package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/shoptik/go-service/internal/model"
	"github.com/shoptik/go-service/internal/repository"
	pb "github.com/shoptik/go-service/pkg/proto/shoptik"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// OrderLogServer implements the OrderLogService gRPC server
type OrderLogServer struct {
	pb.UnimplementedOrderLogServiceServer
	repo *repository.Repository
}

// NewOrderLogServer creates a new OrderLogServer
func NewOrderLogServer(repo *repository.Repository) *OrderLogServer {
	return &OrderLogServer{
		repo: repo,
	}
}

// GetOrderLogs gets logs for a specific order
func (s *OrderLogServer) GetOrderLogs(ctx context.Context, req *pb.GetOrderLogsRequest) (*pb.GetOrderLogsResponse, error) {
	log.Printf("[OrderLogServer] GetOrderLogs called for order: %s", req.GetOrderId())

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
	total, err := s.repo.OrderLogs.CountDocuments(ctx, bson.M{"orderId": req.GetOrderId()})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count order logs: %v", err)
	}

	// Get paginated results
	findOpts := options.Find().
		SetSort(bson.M{"timestamp": -1}). // Most recent first
		SetSkip(int64(skip)).
		SetLimit(int64(limit))

	cursor, err := s.repo.OrderLogs.Find(ctx, bson.M{"orderId": req.GetOrderId()}, findOpts)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list order logs: %v", err)
	}
	defer cursor.Close(ctx)

	var orderLogs []*model.OrderLog
	if err := cursor.All(ctx, &orderLogs); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to decode order logs: %v", err)
	}

	var protoLogs []*pb.OrderLog
	for _, l := range orderLogs {
		protoLogs = append(protoLogs, toProtoOrderLog(l))
	}

	return &pb.GetOrderLogsResponse{
		Logs:  protoLogs,
		Total: int32(total),
		Page:  int32(page),
		Limit: int32(limit),
	}, nil
}

// GetAllOrderLogs gets all logs with pagination (admin view)
func (s *OrderLogServer) GetAllOrderLogs(ctx context.Context, req *pb.GetAllOrderLogsRequest) (*pb.GetAllOrderLogsResponse, error) {
	log.Printf("[OrderLogServer] GetAllOrderLogs called")

	page := int(req.GetPage())
	if page < 1 {
		page = 1
	}
	limit := int(req.GetLimit())
	if limit < 1 {
		limit = 50
	}
	skip := (page - 1) * limit

	// Build filter
	filter := bson.M{}
	if req.GetEventType() != "" {
		filter["eventType"] = req.GetEventType()
	}

	// Get total count
	total, err := s.repo.OrderLogs.CountDocuments(ctx, filter)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count order logs: %v", err)
	}

	// Get paginated results
	findOpts := options.Find().
		SetSort(bson.M{"timestamp": -1}).
		SetSkip(int64(skip)).
		SetLimit(int64(limit))

	cursor, err := s.repo.OrderLogs.Find(ctx, filter, findOpts)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list order logs: %v", err)
	}
	defer cursor.Close(ctx)

	var orderLogs []*model.OrderLog
	if err := cursor.All(ctx, &orderLogs); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to decode order logs: %v", err)
	}

	var protoLogs []*pb.OrderLog
	for _, l := range orderLogs {
		protoLogs = append(protoLogs, toProtoOrderLog(l))
	}

	return &pb.GetAllOrderLogsResponse{
		Logs:  protoLogs,
		Total: int32(total),
		Page:  int32(page),
		Limit: int32(limit),
	}, nil
}

// GetRecentLogs gets recent logs for terminal view
func (s *OrderLogServer) GetRecentLogs(ctx context.Context, req *pb.GetRecentLogsRequest) (*pb.GetRecentLogsResponse, error) {
	log.Printf("[OrderLogServer] GetRecentLogs called, limit: %d", req.GetLimit())

	limit := int(req.GetLimit())
	if limit < 1 {
		limit = 50
	}
	if limit > 200 {
		limit = 200 // Max limit
	}

	// Get recent logs
	findOpts := options.Find().
		SetSort(bson.M{"timestamp": -1}).
		SetLimit(int64(limit))

	cursor, err := s.repo.OrderLogs.Find(ctx, bson.M{}, findOpts)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list recent order logs: %v", err)
	}
	defer cursor.Close(ctx)

	var orderLogs []*model.OrderLog
	if err := cursor.All(ctx, &orderLogs); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to decode order logs: %v", err)
	}

	var protoLogs []*pb.OrderLog
	for _, l := range orderLogs {
		protoLogs = append(protoLogs, toProtoOrderLog(l))
	}

	return &pb.GetRecentLogsResponse{
		Logs: protoLogs,
	}, nil
}

// toProtoOrderLog converts model.OrderLog to proto OrderLog
func toProtoOrderLog(l *model.OrderLog) *pb.OrderLog {
	metadata := make(map[string]string)
	if l.Metadata != nil {
		for k, v := range l.Metadata {
			if str, ok := v.(string); ok {
				metadata[k] = str
			} else {
				// Convert non-string values to JSON string
				if jsonBytes, err := json.Marshal(v); err == nil {
					metadata[k] = string(jsonBytes)
				} else {
					metadata[k] = fmt.Sprintf("%v", v)
				}
			}
		}
	}

	return &pb.OrderLog{
		Id:        l.ID.Hex(),
		OrderId:   l.OrderID,
		UserId:    l.UserID,
		EventType: string(l.EventType),
		Title:     l.Title,
		Message:   l.Message,
		Metadata:  metadata,
		Timestamp: l.Timestamp.Format(time.RFC3339),
		CreatedAt: l.CreatedAt.Format(time.RFC3339),
	}
}
