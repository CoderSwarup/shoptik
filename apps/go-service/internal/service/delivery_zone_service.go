package service

import (
	"context"
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

// DeliveryZoneServer implements the DeliveryZoneService gRPC server
type DeliveryZoneServer struct {
	pb.UnimplementedDeliveryZoneServiceServer
	repo *repository.Repository
}

// NewDeliveryZoneServer creates a new DeliveryZoneServer
func NewDeliveryZoneServer(repo *repository.Repository) *DeliveryZoneServer {
	return &DeliveryZoneServer{repo: repo}
}

// CreateDeliveryZone creates a new delivery zone
func (s *DeliveryZoneServer) CreateDeliveryZone(ctx context.Context, req *pb.CreateDeliveryZoneRequest) (*pb.CreateDeliveryZoneResponse, error) {
	log.Printf("[DeliveryZoneServer] CreateDeliveryZone called")
	log.Printf("[DeliveryZoneServer] Request - Pincode: %q, City: %q, State: %q, IsServiceable: %v, EtaDays: %d, DeliveryCharge: %f",
		req.GetPincode(), req.GetCity(), req.GetState(), req.GetIsServiceable(), req.GetEtaDays(), req.GetDeliveryCharge())

	zone := &model.DeliveryZone{
		Pincode:        req.GetPincode(),
		City:           req.GetCity(),
		State:          req.GetState(),
		IsServiceable:  req.GetIsServiceable(),
		ETADays:        int(req.GetEtaDays()),
		DeliveryCharge: req.GetDeliveryCharge(),
		CreatedAt:      time.Now(),
	}

	log.Printf("[DeliveryZoneServer] Model to insert - Pincode: %q, City: %q, State: %q, IsServiceable: %v, ETADays: %d, DeliveryCharge: %f",
		zone.Pincode, zone.City, zone.State, zone.IsServiceable, zone.ETADays, zone.DeliveryCharge)

	res, err := s.repo.DeliveryZones.InsertOne(ctx, zone)
	if err != nil {
		log.Printf("[DeliveryZoneServer] Error inserting: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to create delivery zone: %v", err)
	}

	zone.ID = res.InsertedID.(primitive.ObjectID)
	log.Printf("[DeliveryZoneServer] Created zone with ID: %s", zone.ID.Hex())

	return &pb.CreateDeliveryZoneResponse{
		DeliveryZone: toProto(zone),
	}, nil
}

// GetDeliveryZone gets a delivery zone by ID
func (s *DeliveryZoneServer) GetDeliveryZone(ctx context.Context, req *pb.GetDeliveryZoneRequest) (*pb.GetDeliveryZoneResponse, error) {
	log.Printf("[DeliveryZoneServer] GetDeliveryZone called with ID: %q", req.GetId())

	id, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		log.Printf("[DeliveryZoneServer] Invalid ID: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "invalid id: %v", err)
	}

	var zone model.DeliveryZone
	err = s.repo.DeliveryZones.FindOne(ctx, bson.M{"_id": id}).Decode(&zone)
	if err != nil {
		log.Printf("[DeliveryZoneServer] Zone not found: %v", err)
		return nil, status.Errorf(codes.NotFound, "delivery zone not found: %v", err)
	}

	return &pb.GetDeliveryZoneResponse{
		DeliveryZone: toProto(&zone),
	}, nil
}

// GetDeliveryZoneByPincode gets a delivery zone by pincode
func (s *DeliveryZoneServer) GetDeliveryZoneByPincode(ctx context.Context, req *pb.GetDeliveryZoneByPincodeRequest) (*pb.GetDeliveryZoneResponse, error) {
	log.Printf("[DeliveryZoneServer] GetDeliveryZoneByPincode called with pincode: %q", req.GetPincode())

	var zone model.DeliveryZone
	err := s.repo.DeliveryZones.FindOne(ctx, bson.M{"pincode": req.GetPincode()}).Decode(&zone)
	if err != nil {
		log.Printf("[DeliveryZoneServer] Zone not found for pincode: %v", err)
		return nil, status.Errorf(codes.NotFound, "delivery zone not found for pincode: %v", err)
	}

	return &pb.GetDeliveryZoneResponse{
		DeliveryZone: toProto(&zone),
	}, nil
}

// ListDeliveryZones lists all delivery zones with pagination
func (s *DeliveryZoneServer) ListDeliveryZones(ctx context.Context, req *pb.ListDeliveryZonesRequest) (*pb.ListDeliveryZonesResponse, error) {
	log.Printf("[DeliveryZoneServer] ListDeliveryZones called - Page: %d, Limit: %d", req.GetPage(), req.GetLimit())

	page := int(req.GetPage())
	if page < 1 {
		page = 1
	}
	limit := int(req.GetLimit())
	if limit < 1 {
		limit = 10
	}
	skip := (page - 1) * limit

	// Get total count
	total, err := s.repo.DeliveryZones.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("[DeliveryZoneServer] Error counting: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to count delivery zones: %v", err)
	}

	// Get paginated results
	findOpts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit))
	cursor, err := s.repo.DeliveryZones.Find(ctx, bson.M{}, findOpts)
	if err != nil {
		log.Printf("[DeliveryZoneServer] Error finding: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list delivery zones: %v", err)
	}
	defer cursor.Close(ctx)

	var zones []*model.DeliveryZone
	if err := cursor.All(ctx, &zones); err != nil {
		log.Printf("[DeliveryZoneServer] Error decoding: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to decode delivery zones: %v", err)
	}

	log.Printf("[DeliveryZoneServer] Found %d zones", len(zones))

	var protoZones []*pb.DeliveryZone
	for _, z := range zones {
		protoZones = append(protoZones, toProto(z))
	}

	return &pb.ListDeliveryZonesResponse{
		DeliveryZones: protoZones,
		Total:         int32(total),
		Page:          int32(page),
		Limit:         int32(limit),
	}, nil
}

// UpdateDeliveryZone updates a delivery zone
func (s *DeliveryZoneServer) UpdateDeliveryZone(ctx context.Context, req *pb.UpdateDeliveryZoneRequest) (*pb.UpdateDeliveryZoneResponse, error) {
	log.Printf("[DeliveryZoneServer] UpdateDeliveryZone called - ID: %q", req.GetId())

	id, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		log.Printf("[DeliveryZoneServer] Invalid ID: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "invalid id: %v", err)
	}

	update := bson.M{}
	if req.Pincode != nil {
		update["pincode"] = req.GetPincode()
	}
	if req.City != nil {
		update["city"] = req.GetCity()
	}
	if req.State != nil {
		update["state"] = req.GetState()
	}
	if req.IsServiceable != nil {
		update["isServiceable"] = req.GetIsServiceable()
	}
	if req.EtaDays != nil {
		update["etaDays"] = req.GetEtaDays()
	}
	if req.DeliveryCharge != nil {
		update["deliveryCharge"] = req.GetDeliveryCharge()
	}

	log.Printf("[DeliveryZoneServer] Update fields: %v", update)

	if len(update) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "no fields to update")
	}

	res, err := s.repo.DeliveryZones.UpdateByID(ctx, id, bson.M{"$set": update})
	if err != nil {
		log.Printf("[DeliveryZoneServer] Error updating: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to update delivery zone: %v", err)
	}
	if res.MatchedCount == 0 {
		return nil, status.Errorf(codes.NotFound, "delivery zone not found")
	}

	// Fetch updated zone
	var zone model.DeliveryZone
	err = s.repo.DeliveryZones.FindOne(ctx, bson.M{"_id": id}).Decode(&zone)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch updated zone: %v", err)
	}

	return &pb.UpdateDeliveryZoneResponse{
		DeliveryZone: toProto(&zone),
	}, nil
}

// DeleteDeliveryZone deletes a delivery zone
func (s *DeliveryZoneServer) DeleteDeliveryZone(ctx context.Context, req *pb.DeleteDeliveryZoneRequest) (*pb.DeleteDeliveryZoneResponse, error) {
	log.Printf("[DeliveryZoneServer] DeleteDeliveryZone called - ID: %q", req.GetId())

	id, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid id: %v", err)
	}

	res, err := s.repo.DeliveryZones.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete delivery zone: %v", err)
	}
	if res.DeletedCount == 0 {
		return nil, status.Errorf(codes.NotFound, "delivery zone not found")
	}

	log.Printf("[DeliveryZoneServer] Deleted zone: %s", req.GetId())

	return &pb.DeleteDeliveryZoneResponse{
		Success: true,
	}, nil
}

// toProto converts a model.DeliveryZone to proto DeliveryZone
func toProto(z *model.DeliveryZone) *pb.DeliveryZone {
	return &pb.DeliveryZone{
		Id:             z.ID.Hex(),
		Pincode:        z.Pincode,
		City:           z.City,
		State:          z.State,
		IsServiceable:  z.IsServiceable,
		EtaDays:        int32(z.ETADays),
		DeliveryCharge: z.DeliveryCharge,
		CreatedAt:      z.CreatedAt.Format(time.RFC3339),
	}
}
