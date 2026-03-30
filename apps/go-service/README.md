# Go Service

High-performance Go HTTP microservice for Shoptik — handles order logs, delivery zones, and notifications with MongoDB.

## Stack

- **Runtime:** Go 1.23
- **Database:** MongoDB
- **Driver:** mongo-driver v1.17

## Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Service manifest |
| `GET` | `/health` | Service health |
| `GET` | `/health/db` | Database connectivity check |

## Environment

Copy `.env.example` to `.env` and configure:

```env
PORT=5002
MONGO_URI=mongodb://admin:mongo_secret_password@localhost:27018/shoptik?authSource=admin
MONGO_DB=shoptik
```

## Development

### Prerequisites

- Go 1.23+
- MongoDB running (use Docker Compose)

### Install Dependencies

```bash
go mod download
```

### Start MongoDB

```bash
# From project root
cd ../../docker
docker compose up -d
```

### Run in Development

```bash
# From apps/go-service
go run ./cmd/server
```

Server runs at `http://localhost:5002`

## Production

### Build

```bash
go build -o bin/server ./cmd/server
```

### Run

```bash
./bin/server
```

On Windows:

```bash
go build -o bin/server.exe ./cmd/server
bin\server.exe
```

### Docker (optional)

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 5002
CMD ["./server"]
```

## Project Structure

```
go-service/
├── cmd/server/main.go       # Entry point
├── internal/
│   ├── config/              # Config loading
│   ├── handler/             # HTTP handlers
│   ├── model/               # MongoDB models
│   ├── repository/          # Data access
│   ├── router/              # Route registration
│   └── service/             # Business logic
├── pkg/response/            # JSON helpers
├── .env
├── .env.example
└── go.mod
```

## Collections

| Collection | Purpose |
|------------|---------|
| `order_logs` | Order processing logs |
| `delivery_zones` | Serviceable delivery areas |
| `notifications` | User notifications |
