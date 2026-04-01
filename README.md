# 🚀 Shoptik – Distributed Commerce Platform

Shoptik is a modern **distributed e-commerce system** built to demonstrate real-world backend architecture using microservices, real-time communication, and scalable design patterns.

---

## 🧠 Overview

Shoptik combines multiple technologies to simulate a production-grade system:

- **Frontend:** Next.js (User + Admin)
- **API Layer:** NestJS (REST API)
- **Sync Communication:** gRPC (NestJS → Go)
- **Async Processing:** BullMQ (Redis)
- **Core Database:** PostgreSQL
- **Logs & Events:** MongoDB
- **Realtime Logs:** SSE (Server-Sent Events)
- **Notifications:** WebSocket

---

## ⚙️ Architecture

```
User → React → NestJS API

NestJS:
  → PostgreSQL (orders, users)
  → gRPC → Go Service (validation)
  → Queue → BullMQ

Go Service:
  → MongoDB (logs, events)
  → SSE → Admin logs dashboard
  → WebSocket → user/admin notifications
```

---

## 🔄 Core Flow

1. User places an order
2. NestJS validates address via **gRPC (Go service)**
3. Order is stored in **PostgreSQL**
4. Event pushed to **BullMQ queue**
5. Go worker processes job
6. Logs stored in **MongoDB**
7. Logs streamed via **SSE (Admin)**
8. Notifications sent via **WebSocket (User/Admin)**

---

## 🧩 Key Features

- 🛍️ Product browsing & ordering
- 📦 Order tracking (real-time)
- 📜 Live logs dashboard (SSE)
- 🔔 Real-time notifications (WebSocket)
- ⚡ Address validation (gRPC)
- 🧵 Background processing (BullMQ)

---

## 🗄️ Databases

### PostgreSQL

- Users
- Products
- Orders
- Payments

### MongoDB

- Order logs
- Processing data
- Notifications
- Delivery zones

---

## 🏗️ Tech Highlights

- Microservice architecture
- Polyglot backend (Node.js + Go)
- Event-driven system
- Real-time communication
- Scalable & production-ready design

---

## 🚀 Goal

This project is built to:

- Learn real-world backend systems
- Understand distributed architecture
- Implement modern communication patterns (gRPC, queues, streaming)

---

## 📌 Status

🚧 In Development – Building core features and infrastructure

---

## 🏆 Summary

Shoptik is not just an e-commerce app — it’s a **learning platform for building scalable distributed systems** using modern technologies.

---
