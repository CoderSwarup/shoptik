package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/shoptik/go-service/internal/config"
	"github.com/shoptik/go-service/internal/handler"
	"github.com/shoptik/go-service/internal/repository"
	"github.com/shoptik/go-service/internal/router"
	"github.com/shoptik/go-service/internal/service"
	pb "github.com/shoptik/go-service/pkg/proto/shoptik"
	"google.golang.org/grpc"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize MongoDB repository
	repo, err := repository.New(cfg)
	if err != nil {
		log.Fatalf("[main] failed to connect to database: %v", err)
	}
	defer func() {
		if err := repo.Close(); err != nil {
			log.Printf("[main] error closing database connection: %v", err)
		}
	}()

	// Initialize WebSocket hub
	wsHub := service.NewWebSocketHub()
	go wsHub.Run()

	// Initialize Redis subscriber
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}
	redisSub := service.NewRedisSubscriber(redisURL, wsHub)
	redisSub.Start()
	defer redisSub.Stop()

	// Initialize services
	healthSvc := service.NewHealthService(cfg, repo)
	deliveryZoneSvc := service.NewDeliveryZoneServer(repo)
	notificationSvc := service.NewNotificationServer(repo, wsHub)

	// Initialize HTTP handlers and router
	h := handler.New(healthSvc)
	r := router.New(h)

	// Add WebSocket endpoint
	r.Mux().HandleFunc("/ws", wsHub.HandleWebSocket)

	// Create HTTP server
	httpSrv := &http.Server{
		Addr:         ":" + cfg.HTTPPort,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Create gRPC server
	grpcSrv := grpc.NewServer()
	pb.RegisterDeliveryZoneServiceServer(grpcSrv, deliveryZoneSvc)
	pb.RegisterNotificationServiceServer(grpcSrv, notificationSvc)

	// Start HTTP server in a goroutine
	go func() {
		fmt.Printf("\n🚀 go-service HTTP running on http://localhost:%s\n", cfg.HTTPPort)
		fmt.Println("   GET /           → service manifest")
		fmt.Println("   GET /health     → service health")
		fmt.Println("   GET /health/db  → database health")
		fmt.Println("   WS  /ws         → WebSocket for notifications")

		if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[main] HTTP server error: %v", err)
		}
	}()

	// Start gRPC server in a goroutine
	go func() {
		lis, err := net.Listen("tcp", ":"+cfg.GRPCPort)
		if err != nil {
			log.Fatalf("[main] failed to listen for gRPC: %v", err)
		}

		fmt.Printf("\n🔧 go-service gRPC running on localhost:%s\n", cfg.GRPCPort)
		fmt.Println("   DeliveryZoneService → CRUD for delivery zones")
		fmt.Println("   NotificationService → Notifications & WebSocket\n")

		if err := grpcSrv.Serve(lis); err != nil {
			log.Fatalf("[main] gRPC server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[main] shutting down servers...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Shutdown HTTP server
	if err := httpSrv.Shutdown(ctx); err != nil {
		log.Printf("[main] HTTP server shutdown error: %v", err)
	}

	// Shutdown gRPC server
	grpcSrv.GracefulStop()

	log.Println("[main] servers exited properly")
}
