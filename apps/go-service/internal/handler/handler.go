package handler

import (
	"net/http"

	"github.com/shoptik/go-service/internal/service"
	"github.com/shoptik/go-service/pkg/response"
)

// Handler holds all HTTP handlers
type Handler struct {
	healthSvc *service.HealthService
}

// New creates a new Handler instance
func New(healthSvc *service.HealthService) *Handler {
	return &Handler{healthSvc: healthSvc}
}

// Root handles GET / - returns service manifest
func (h *Handler) Root(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	response.Success(w, h.healthSvc.GetServiceInfo())
}

// Health handles GET /health - returns service health
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	response.Success(w, h.healthSvc.GetHealth())
}

// HealthDB handles GET /health/db - returns database connectivity status
func (h *Handler) HealthDB(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	response.Success(w, h.healthSvc.GetDbHealth(r.Context()))
}
