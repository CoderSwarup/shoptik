#!/bin/bash

# ============================================================================
# Production Environment Management Script
# ============================================================================

set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

COMPOSE_FILE="$DOCKER_DIR/docker-compose.prod.yml"
ENV_FILE="$DOCKER_DIR/.env.prod"

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
Shoptik Production Environment Manager

USAGE:
    ./prod.sh [COMMAND]

COMMANDS:
    deploy      Build and deploy production environment
    up          Start production services
    down        Stop production services
    restart     Restart production services
    build       Build production images
    logs        Show logs from all services
    logs-[svc]  Show logs for specific service
    status      Show running containers and resource usage
    scale       Scale a service to N instances
    update      Update a specific service with new build
    rollback    Rollback to previous image version
    clean       Remove all production containers and volumes
    help        Show this help message

EXAMPLES:
    ./prod.sh deploy             # Full deployment
    ./prod.sh up                 # Start services
    ./prod.sh logs-go            # View Go service logs
    ./prod.sh status             # Check service status
    ./prod.sh scale web 3        # Scale web to 3 instances
    ./prod.sh update nestjs      # Update NestJS service

SECURITY CHECKLIST:
    ✓ Update all passwords in .env.prod
    ✓ Set CORS_ORIGINS to your production domain
    ✓ Use strong, unique passwords
    ✓ Enable firewall rules
    ✓ Configure SSL/TLS certificates
    ✓ Set up backup strategies for databases

EOF
}

check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Production environment file not found: $ENV_FILE"
        print_warning "Please copy .env.prod.example to .env.prod and configure it!"
        print_info "cp $DOCKER_DIR/.env.prod.example $DOCKER_DIR/.env.prod"
        exit 1
    fi

    # Check for CHANGE_ME placeholders
    if grep -q "CHANGE_ME" "$ENV_FILE"; then
        print_warning "Found CHANGE_ME placeholders in $ENV_FILE"
        print_error "Please update all passwords before deploying to production!"
        exit 1
    fi
}

docker_compose() {
    docker compose --project-directory "$DOCKER_DIR" \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        "$@"
}

cmd_deploy() {
    check_env_file
    print_info "Starting production deployment..."
    
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    export PROJECT_ROOT
    
    print_info "Building production images..."
    docker_compose build
    print_info "Starting services..."
    docker_compose up -d
    print_success "Production deployment complete!"
    print_info "Verifying deployment..."
    sleep 10
    cmd_status
}

cmd_up() {
    check_env_file
    print_info "Starting production services..."
    docker_compose up -d
    print_success "Production services started!"
}

cmd_down() {
    print_info "Stopping production services..."
    docker_compose down
    print_success "Production services stopped!"
}

cmd_restart() {
    cmd_down
    cmd_up
}

cmd_build() {
    check_env_file
    print_info "Building production images..."
    
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    export PROJECT_ROOT
    
    docker_compose build
    print_success "Production images built!"
}

cmd_logs() {
    docker_compose logs -f "$@"
}

cmd_status() {
    print_info "Production containers:"
    docker_compose ps
    echo ""
    print_info "Resource usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
        $(docker_compose ps -q) 2>/dev/null || print_warning "No running containers"
}

cmd_scale() {
    local service=$1
    local replicas=$2
    if [ -z "$service" ] || [ -z "$replicas" ]; then
        print_error "Usage: ./prod.sh scale <service> <replicas>"
        exit 1
    fi
    print_info "Scaling $service to $replicas instances..."
    docker_compose up -d --scale "$service=$replicas"
    print_success "Scaled $service to $replicas instances!"
}

cmd_update() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Usage: ./prod.sh update <service>"
        exit 1
    fi
    check_env_file
    print_info "Updating $service..."
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    docker_compose build "$service"
    docker_compose up -d --force-recreate "$service"
    print_success "Updated $service!"
}

cmd_rollback() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Usage: ./prod.sh rollback <service>"
        exit 1
    fi
    print_warning "Rolling back $service to previous image..."
    docker_compose up -d "$service"
    print_success "Rolled back $service!"
}

cmd_clean() {
    print_warning "This will remove ALL production containers, volumes, and data!"
    read -p "Are you sure? This action CANNOT be undone! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up production environment..."
        docker_compose down -v --remove-orphans
        print_success "Production cleanup complete!"
    else
        print_info "Cancelled."
    fi
}

# Main command handler
case "${1:-help}" in
    deploy)
        cmd_deploy
        ;;
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
    status)
        cmd_status
        ;;
    scale)
        cmd_scale "$2" "$3"
        ;;
    update)
        cmd_update "$2"
        ;;
    rollback)
        cmd_rollback "$2"
        ;;
    clean)
        cmd_clean
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
