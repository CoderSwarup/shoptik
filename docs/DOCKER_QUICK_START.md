# Docker Quick Start Guide

## 📁 File Structure

```
SHOPTIK/
├── docker/
│   ├── .env.dev                # Development environment config
│   ├── .env.prod               # Production environment config
│   ├── docker-compose.yml      # Infrastructure only (databases)
│   ├── docker-compose.dev.yml  # Full dev environment
│   └── docker-compose.prod.yml # Production deployment
│
├── scripts/docker/
│   ├── dev.sh                  # Development management script
│   └── prod.sh                 # Production management script
│
├── docs/
│   └── DOCKER_QUICK_START.md   # This file
│
└── apps/
    ├── go-service/docker/      # Go service Dockerfiles
    ├── nestjs-service/docker/  # NestJS service Dockerfiles
    └── web/docker/             # Web service Dockerfiles
```

---

## 🚀 Quick Start - Development

### Run from ANYWHERE in the project

```bash
# From project root
./scripts/docker/dev.sh up

# Or from any directory
bash scripts/docker/dev.sh up
```

### 1. Start Everything

```bash
# From project root (recommended)
./scripts/docker/dev.sh up

# From docker directory
cd docker && ../scripts/docker/dev.sh up
```

This starts all services:
- **Web App**: http://localhost:3000
- **NestJS API**: http://localhost:5001
- **Go API**: http://localhost:5002
- **Databases**: PostgreSQL, MongoDB, Redis
- **Admin UIs**: pgAdmin (8080), Mongo Express (8081), RedisInsight (5540)

### 2. View Logs

```bash
# All services
./scripts/docker/dev.sh logs

# Specific service
./scripts/docker/dev.sh logs-go
./scripts/docker/dev.sh logs-nestjs
./scripts/docker/dev.sh logs-web
```

### 3. Stop Everything

```bash
./scripts/docker/dev.sh down
```

### 4. Clean Everything

```bash
./scripts/docker/dev.sh clean
```

---

## 🚀 Quick Start - Production

### 1. Configure Environment

```bash
# Edit .env.prod and update all CHANGE_ME values with strong passwords
nano docker/.env.prod
```

### 2. Deploy

```bash
./scripts/docker/prod.sh deploy
```

### 3. Monitor

```bash
# Check status
./scripts/docker/prod.sh status

# View logs
./scripts/docker/prod.sh logs
```

---

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| NestJS API | http://localhost:5001 |
| Go HTTP API | http://localhost:5002 |
| Go gRPC | localhost:5003 |
| PostgreSQL | localhost:5432 |
| MongoDB | localhost:27018 |
| Redis | localhost:6379 |
| pgAdmin | http://localhost:8080 |
| Mongo Express | http://localhost:8081 |
| RedisInsight | http://localhost:5540 |

---

## 📝 Common Commands

### Development

```bash
# Start all services (from project root)
./scripts/docker/dev.sh up

# Start only databases
./scripts/docker/dev.sh infra

# Stop all services
./scripts/docker/dev.sh down

# View logs
./scripts/docker/dev.sh logs-go

# Shell into container
./scripts/docker/dev.sh exec-nestjs

# Rebuild images
./scripts/docker/dev.sh build

# Clean everything
./scripts/docker/dev.sh clean
```

### Production

```bash
# Deploy
./scripts/docker/prod.sh deploy

# Start/Stop
./scripts/docker/prod.sh up
./scripts/docker/prod.sh down

# Scale service
./scripts/docker/prod.sh scale web 3

# Update service
./scripts/docker/prod.sh update nestjs

# Check status
./scripts/docker/prod.sh status
```

---

## ⚠️ Important Notes

### Before Production Deployment

1. Update all passwords in `.env.prod`
2. Set `CORS_ORIGINS` to your production domain
3. Configure firewall rules
4. Set up database backups

### Default Development Passwords

See `.env.dev` for current passwords. Change them if needed.

---

For more details, see the individual Dockerfiles in `apps/*/docker/`.
