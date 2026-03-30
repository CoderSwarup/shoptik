package response

import (
	"encoding/json"
	"net/http"
)

// JSON writes a JSON response with the given status code
func JSON(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// Success writes a success JSON response
func Success(w http.ResponseWriter, data any) {
	JSON(w, http.StatusOK, data)
}

// Error writes an error JSON response
func Error(w http.ResponseWriter, statusCode int, message string) {
	JSON(w, statusCode, map[string]any{
		"status":  "error",
		"message": message,
	})
}
