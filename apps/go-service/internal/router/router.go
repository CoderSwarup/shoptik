package router

import (
	"net/http"

	"github.com/shoptik/go-service/internal/handler"
)

// Router holds the HTTP router and dependencies
type Router struct {
	mux     *http.ServeMux
	handler *handler.Handler
}

// New creates a new Router instance
func New(h *handler.Handler) *Router {
	r := &Router{
		mux:     http.NewServeMux(),
		handler: h,
	}
	r.routes()
	return r
}

// routes registers all application routes
func (r *Router) routes() {
	r.mux.HandleFunc("/", r.handler.Root)
	r.mux.HandleFunc("/health", r.handler.Health)
	r.mux.HandleFunc("/health/db", r.handler.HealthDB)
}

// ServeHTTP implements the http.Handler interface
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	r.mux.ServeHTTP(w, req)
}

// Mux returns the underlying ServeMux for advanced use
func (r *Router) Mux() *http.ServeMux {
	return r.mux
}
