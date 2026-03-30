package main

import (
	"context"
	"fmt"
	"log"
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

	// Initialize services
	healthSvc := service.NewHealthService(cfg, repo)

	// Initialize handlers
	h := handler.New(healthSvc)

	// Initialize router
	r := router.New(h)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		fmt.Printf("\n🚀 go-service running on http://localhost:%s\n", cfg.Port)
		fmt.Println("   GET /           → service manifest")
		fmt.Println("   GET /health     → service health")
		fmt.Println("   GET /health/db  → database health\n")

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[main] server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[main] shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("[main] server forced to shutdown: %v", err)
	}

	log.Println("[main] server exited properly")
}
