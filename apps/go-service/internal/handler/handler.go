package handler

import (
	"encoding/json"
	"net/http"

	"github.com/shoptik/go-service/internal/service"
	"github.com/shoptik/go-service/pkg/response"
	pb "github.com/shoptik/go-service/pkg/proto/shoptik"
)

// Handler holds all HTTP handlers
type Handler struct {
	healthSvc   *service.HealthService
	orderLogSvc *service.OrderLogServer
}

// New creates a new Handler instance
func New(healthSvc *service.HealthService, orderLogSvc *service.OrderLogServer) *Handler {
	return &Handler{
		healthSvc:   healthSvc,
		orderLogSvc: orderLogSvc,
	}
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

// OrderLogsSSE handles GET /sse/order-logs - streams order logs via SSE
func (h *Handler) OrderLogsSSE(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	// Set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("X-Accel-Buffering", "no") // Disable nginx buffering

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	ctx := r.Context()

	// Send initial connection message
	w.Write([]byte("data: {\"type\":\"connected\",\"message\":\"SSE stream connected\"}\n\n"))
	flusher.Flush()

	// Get recent logs first (last 50)
	recentResp, err := h.orderLogSvc.GetRecentLogs(ctx, &pb.GetRecentLogsRequest{Limit: 50})
	if err == nil && len(recentResp.Logs) > 0 {
		for _, log := range recentResp.Logs {
			data := map[string]interface{}{
				"type": "log",
				"data": log,
			}
			jsonData, _ := json.Marshal(data)
			w.Write(append(jsonData, '\n', '\n'))
			flusher.Flush()
		}
	}

	// TODO: Set up real-time streaming from MongoDB change stream or Redis pub/sub
	// For now, client will poll every few seconds if needed
	<-ctx.Done()
}
