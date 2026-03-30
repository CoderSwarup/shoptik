package service

import (
	"context"
	"time"

	"github.com/shoptik/go-service/internal/config"
	"github.com/shoptik/go-service/internal/repository"
)

// HealthService handles health-related business logic
type HealthService struct {
	cfg  *config.Config
	repo *repository.Repository
}

// NewHealthService creates a new health service
func NewHealthService(cfg *config.Config, repo *repository.Repository) *HealthService {
	return &HealthService{cfg: cfg, repo: repo}
}

// GetServiceInfo returns basic service information
func (s *HealthService) GetServiceInfo() map[string]any {
	return map[string]any{
		"service":     "go-service",
		"status":      "ok",
		"version":     "0.0.1",
		"port":        s.cfg.Port,
		"timestamp":   time.Now().UTC().Format(time.RFC3339),
		"environment": "development",
		"routes": []map[string]string{
			{"method": "GET", "path": "/", "description": "Service manifest (this response)"},
			{"method": "GET", "path": "/health", "description": "Service health info"},
			{"method": "GET", "path": "/health/db", "description": "Database connectivity check"},
		},
		"stack": map[string]string{
			"runtime":  "Go 1.23",
			"database": "MongoDB",
			"driver":   "mongo-driver",
		},
	}
}

// GetHealth returns service health status
func (s *HealthService) GetHealth() map[string]any {
	return map[string]any{
		"service":   "go-service",
		"status":    "ok",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
}

// GetDbHealth returns database connectivity status
func (s *HealthService) GetDbHealth(ctx context.Context) map[string]any {
	return s.repo.Health(ctx)
}
