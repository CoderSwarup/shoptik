package service

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/shoptik/go-service/internal/model"
)

// WebSocketHub manages WebSocket connections and broadcasts messages
type WebSocketHub struct {
	clients    map[string]map[*Client]bool // userId -> clients
	broadcast  chan *model.Notification
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// Client represents a WebSocket client
type Client struct {
	hub    *WebSocketHub
	conn   *websocket.Conn
	send   chan []byte
	userID string
	role   string // USER or ADMIN
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development
		return true
	},
}

// NewWebSocketHub creates a new WebSocketHub
func NewWebSocketHub() *WebSocketHub {
	return &WebSocketHub{
		clients:    make(map[string]map[*Client]bool),
		broadcast:  make(chan *model.Notification, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the WebSocket hub
func (h *WebSocketHub) Run() {
	log.Println("[WebSocketHub] Starting...")
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.userID] == nil {
				h.clients[client.userID] = make(map[*Client]bool)
			}
			h.clients[client.userID][client] = true
			h.mu.Unlock()
			log.Printf("[WebSocketHub] Client registered: userID=%s, role=%s", client.userID, client.role)

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.clients[client.userID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.clients, client.userID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WebSocketHub] Client unregistered: userID=%s", client.userID)

		case notification := <-h.broadcast:
			h.broadcastNotification(notification)
		}
	}
}

// broadcastNotification sends notification to relevant clients
func (h *WebSocketHub) broadcastNotification(notification *model.Notification) {
	message, err := json.Marshal(map[string]interface{}{
		"type":      "notification",
		"data":      notification,
		"timestamp": time.Now().Unix(),
	})
	if err != nil {
		log.Printf("[WebSocketHub] Error marshaling notification: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	// Send to specific user
	if clients, ok := h.clients[notification.UserID]; ok {
		for client := range clients {
			select {
			case client.send <- message:
			default:
				// Client send buffer full, close connection
				close(client.send)
				delete(clients, client)
			}
		}
	}

	// Send to admins if it's an admin notification
	if notification.Role == model.UserRoleAdmin {
		for userID, clients := range h.clients {
			// Check if any client for this user is an admin
			for client := range clients {
				if client.role == "ADMIN" {
					select {
					case client.send <- message:
					default:
						close(client.send)
						delete(clients, client)
					}
					break // Only send once per user
				}
				_ = userID // Avoid unused variable
			}
		}
	}
}

// Broadcast sends a notification to all relevant clients
func (h *WebSocketHub) Broadcast(notification *model.Notification) {
	h.broadcast <- notification
}

// HandleWebSocket handles WebSocket connections
func (h *WebSocketHub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Get userID and role from query params (in production, use JWT token)
	userID := r.URL.Query().Get("userId")
	role := r.URL.Query().Get("role")
	if userID == "" {
		userID = "anonymous"
	}
	if role == "" {
		role = "USER"
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WebSocketHub] Upgrade error: %v", err)
		return
	}

	client := &Client{
		hub:    h,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		role:   role,
	}

	h.register <- client

	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}

// readPump pumps messages from the WebSocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WebSocketHub] Read error: %v", err)
			}
			break
		}
		// Handle incoming messages (ping/pong, ack, etc.)
	}
}

// writePump pumps messages from the hub to the WebSocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.conn.WriteMessage(websocket.TextMessage, message)

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// GetStats returns WebSocket hub statistics
func (h *WebSocketHub) GetStats() map[string]interface{} {
	h.mu.RLock()
	defer h.mu.RUnlock()

	totalClients := 0
	for _, clients := range h.clients {
		totalClients += len(clients)
	}

	return map[string]interface{}{
		"connectedUsers": len(h.clients),
		"totalClients":   totalClients,
	}
}
