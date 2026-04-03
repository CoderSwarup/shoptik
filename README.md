# Shoptik – Distributed Commerce Platform

Shoptik is a modern **distributed e-commerce system** built to demonstrate real-world backend architecture using microservices, real-time communication, and scalable design patterns.

---

## Overview

Shoptik combines multiple technologies to simulate a production-grade system:

- **Frontend:** Next.js (User + Admin) — Port 3000
- **API Layer:** NestJS (REST API) — Port 5001
- **Sync Communication:** gRPC (NestJS → Go) — Port 5003
- **Async Messaging:** Redis Pub/Sub (real-time notifications)
- **Core Database:** PostgreSQL (users, orders, products)
- **Logs & Notifications:** MongoDB (logs, notifications, delivery zones)
- **Realtime Notifications:** WebSocket (Go service → Frontend)
- **Cache / Broker:** Redis

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js (3000)                          │
│   Browser ──WebSocket──▶ useNotifications hook                  │
│             REST API ──▶ Navbar + Dashboard                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP REST
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       NestJS API (5001)                         │
│                                                                 │
│  Routes: /users  /products  /orders  /addresses                 │
│          /delivery-zones  /notifications                        │
│                                                                 │
│  ┌─────────────────────┐   ┌──────────────────────────────┐    │
│  │  NotificationService│──▶│  Redis Pub/Sub (Publisher)   │    │
│  │  (publish on events)│   │  channels:                   │    │
│  └─────────────────────┘   │  • notifications:all         │    │
│                            │  • notifications:admin       │    │
│  ┌─────────────────────┐   │  • notifications:user:{id}   │    │
│  │  gRPC Client        │   └──────────────────────────────┘    │
│  │  (delivery zones,   │                                        │
│  │   notifications,    │                                        │
│  │   address validate) │                                        │
│  └──────────┬──────────┘                                        │
└─────────────┼───────────────────────────────────────────────────┘
              │ gRPC (5003)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Go Service (5002 HTTP / 5003 gRPC)         │
│                                                                 │
│  gRPC Servers:                                                  │
│  • DeliveryZoneService  (CRUD + pincode lookup)                 │
│  • NotificationService  (create, list, mark read)              │
│                                                                 │
│  ┌──────────────────────┐   ┌───────────────────────────────┐  │
│  │  Redis Subscriber    │──▶│  WebSocket Hub                │  │
│  │  (listens to all     │   │  • routes by userId / role    │  │
│  │   pub/sub channels)  │   │  • broadcasts to clients      │  │
│  └──────────────────────┘   └───────────────┬───────────────┘  │
│                                             │ ws://             │
│  MongoDB:                                   │                   │
│  • notifications collection                 ▼                   │
│  • delivery_zones collection         Next.js client             │
│  • order logs                        (useNotifications)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Notification Flow

```
1. Event occurs (order placed, status change, etc.)
         │
         ▼
2. NestJS NotificationService.publish()
         │
         ├──▶ Redis PUBLISH notifications:user:{id}   (or :admin)
         │
         └──▶ gRPC CreateNotification → Go service → MongoDB
                                                │
                                                ▼
3. Go Redis Subscriber receives message
         │
         ▼
4. WebSocket Hub broadcasts to connected clients
         │
         ▼
5. Browser receives message via WebSocket
         │
         ▼
6. useNotifications hook updates state → NotificationBell UI
```

---

## Core Flow

1. User places an order
2. NestJS validates address pincode via **gRPC** (Go service checks delivery zones)
3. Order stored in **PostgreSQL**
4. NestJS publishes notification to **Redis Pub/Sub**
5. Go service persists notification in **MongoDB**
6. Go **WebSocket hub** broadcasts to the user's connected browser tab
7. Frontend `NotificationBell` shows real-time update

---

## Key Features

- Product browsing & ordering
- Order tracking (real-time)
- Real-time notifications (WebSocket + Redis Pub/Sub)
- Address / pincode validation (gRPC)
- Delivery zone management (gRPC CRUD)
- Notification persistence (MongoDB)
- Live unread count badge with auto-reconnect

---

## Databases

### PostgreSQL
- Users
- Products
- Orders
- Payments
- Addresses

### MongoDB
- Order logs
- Notifications
- Delivery zones

### Redis
- Pub/Sub broker (NestJS publishes → Go subscribes)
- Session / cache

---

## Services & Ports

| Service     | Port(s)        | Role                              |
|-------------|----------------|-----------------------------------|
| Next.js     | 3000           | Frontend (SSR + Client)           |
| NestJS      | 5001           | REST API, gRPC client             |
| Go service  | 5002 (HTTP/WS) | WebSocket, REST                   |
| Go service  | 5003 (gRPC)    | gRPC server                       |
| PostgreSQL  | 5432           | Relational data                   |
| MongoDB     | 27017          | Documents (notifications, logs)   |
| Redis       | 6379           | Pub/Sub + cache                   |

---

## Tech Highlights

- Microservice architecture (NestJS + Go)
- Polyglot backend (Node.js + Go)
- gRPC for synchronous inter-service communication
- Redis Pub/Sub for asynchronous real-time messaging
- WebSocket (gorilla/websocket) for live browser updates
- Event-driven notification system
- Scalable & production-ready design patterns

---

## Status

In Development – Building core features and infrastructure
