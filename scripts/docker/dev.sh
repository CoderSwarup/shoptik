#!/bin/bash

# ============================================================================
# Development Environment Management Script
# ============================================================================

set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

COMPOSE_FILE="$DOCKER_DIR/docker-compose.dev.yml"
ENV_FILE="$DOCKER_DIR/.env.dev"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

show_help() {
    cat << EOF
Shoptik Development Environment Manager

USAGE:
    ./dev.sh [COMMAND]

COMMANDS:
    up          Start all services (infrastructure + applications)
    down        Stop all services
    restart     Restart all services
    build       Rebuild all application images
    logs        Show logs from all services
    logs-[svc]  Show logs for specific service (go, nestjs, web)
    exec-[svc]  Enter container shell (go, nestjs, web)
    status      Show running containers
    clean       Remove all containers, volumes, and networks
    infra       Start only infrastructure (databases + admin tools)
    help        Show this help message

EXAMPLES:
    ./dev.sh up              # Start everything
    ./dev.sh infra           # Start only databases
    ./dev.sh logs-go         # View Go service logs
    ./dev.sh exec-nestjs     # Shell into NestJS container
    ./dev.sh clean           # Clean everything

SERVICES:
    go        Go Service (Port: 5002 HTTP, 5003 gRPC)
    nestjs    NestJS Service (Port: 5001)
    web       Next.js Web App (Port: 3000)
    postgres  PostgreSQL Database (Port: 5432)
    mongo     MongoDB Database (Port: 27018)
    redis     Redis Cache (Port: 6379)

ADMIN UIs:
    pgadmin       PostgreSQL Admin - http://localhost:8080
    mongo-express MongoDB Admin    - http://localhost:8081
    redisinsight  Redis Admin      - http://localhost:5540

EOF
}

check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Environment file not found: $ENV_FILE"
        print_info "Creating from example..."
        cp "$DOCKER_DIR/.env.dev.example" "$ENV_FILE"
        print_success "Created $ENV_FILE. Please update passwords if needed."
    fi
}

docker_compose() {
    docker compose --project-directory "$DOCKER_DIR" \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        "$@"
}

cmd_up() {
    check_env_file
    print_info "Starting development environment..."
    docker_compose up -d --build
    print_success "Development environment started!"
    print_info "Access points:"
    echo "  - Web App:       http://localhost:3000"
    echo "  - NestJS API:    http://localhost:5001"
    echo "  - Go HTTP API:   http://localhost:5002"
    echo "  - Go gRPC:       localhost:5003"
    echo "  - pgAdmin:       http://localhost:8080"
    echo "  - Mongo Express: http://localhost:8081"
    echo "  - RedisInsight:  http://localhost:5540"
}

cmd_down() {
    print_info "Stopping development environment..."
    docker_compose down
    print_success "Development environment stopped!"
}

cmd_restart() {
    cmd_down
    cmd_up
}

cmd_build() {
    print_info "Building application images..."
    docker_compose build --no-cache
    print_success "Images built successfully!"
}

cmd_logs() {
    docker_compose logs -f "$@"
}

cmd_status() {
    print_info "Running containers:"
    docker_compose ps
}

cmd_clean() {
    print_warning "This will remove ALL containers, volumes, and networks!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker_compose down -v --remove-orphans
        print_success "Cleanup complete!"
    else
        print_info "Cancelled."
    fi
}

cmd_infra() {
    check_env_file
    print_info "Starting infrastructure services only..."
    docker_compose up -d postgres mongo redis mongo-express redisinsight pgadmin
    print_success "Infrastructure started!"
    print_info "Databases available at:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - MongoDB:    localhost:27018"
    echo "  - Redis:      localhost:6379"
    print_info "Admin UIs:"
    echo "  - pgAdmin:       http://localhost:8080"
    echo "  - Mongo Express: http://localhost:8081"
    echo "  - RedisInsight:  http://localhost:5540"
}

cmd_exec() {
    local service=$1
    docker_compose exec "$service" /bin/sh
}

# Main command handler
case "${1:-help}" in
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    restart)
        cmd_restart
        ;;
    build)
        cmd_build
        ;;
    logs)
        cmd_logs
        ;;
    logs-go)
        cmd_logs go-service
        ;;
    logs-nestjs)
        cmd_logs nestjs-service
        ;;
    logs-web)
        cmd_logs web
        ;;
    exec-go)
        cmd_exec go-service
        ;;
    exec-nestjs)
        cmd_exec nestjs-service
        ;;
    exec-web)
        cmd_exec web
        ;;
    status)
        cmd_status
        ;;
    clean)
        cmd_clean
        ;;
    infra)
        cmd_infra
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
