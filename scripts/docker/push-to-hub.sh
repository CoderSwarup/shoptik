#!/bin/bash
# ============================================================================
# Push Images to Docker Hub
# ============================================================================

set -e

# Configuration - CHANGE THESE
DOCKER_USERNAME="YOUR_DOCKER_USERNAME"
IMAGE_TAG="latest"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }
print_public() { echo -e "${BLUE}🌐 $1${NC}"; }
print_private() { echo -e "${RED}🔒 $1${NC}"; }

show_help() {
    cat << EOF
Docker Hub Push Script

USAGE:
    ./push-to-hub.sh [OPTION]

OPTIONS:
    public      Push as public images (no Docker secret needed in K8s)
    private     Push as private images (Docker secret required in K8s)
    help        Show this help message

EXAMPLES:
    ./push-to-hub.sh           # Interactive mode - asks for public/private
    ./push-to-hub.sh public    # Push as public images
    ./push-to-hub.sh private   # Push as private images

EOF
}

# Check if user has configured username
if [ "$DOCKER_USERNAME" = "YOUR_DOCKER_USERNAME" ]; then
    print_error "Please edit this script and set DOCKER_USERNAME"
    echo "Edit line 9 in: $0"
    exit 1
fi

# Check Docker login
if ! docker info &>/dev/null; then
    print_error "Docker is not running or not logged in"
    print_info "Run: docker login -u $DOCKER_USERNAME"
    exit 1
fi

# Determine mode
MODE=""
case "${1:-}" in
    public)
        MODE="public"
        ;;
    private)
        MODE="private"
        ;;
    help|-h|--help)
        show_help
        exit 0
        ;;
    *)
        echo ""
        echo "=========================================="
        echo "Docker Hub Push Script"
        echo "=========================================="
        echo ""
        echo "Choose image visibility:"
        echo ""
        print_public "1) PUBLIC  - Anyone can pull (no K8s secret needed)"
        print_private "2) PRIVATE - Requires Docker secret in K8s"
        echo ""
        read -p "Choose (1/2): " choice
        
        case "$choice" in
            1) MODE="public" ;;
            2) MODE="private" ;;
            *) print_error "Invalid option"; exit 1 ;;
        esac
        ;;
esac

echo ""
echo "=========================================="
echo "Docker Hub Push Script"
echo "=========================================="
echo ""

if [ "$MODE" = "public" ]; then
    print_public "Mode: PUBLIC"
    echo "  - Anyone can pull these images"
    echo "  - No Docker secret needed in Kubernetes"
    echo "  - Good for: Open source, learning"
else
    print_private "Mode: PRIVATE"
    echo "  - Only you can pull these images"
    echo "  - Docker secret REQUIRED in Kubernetes"
    echo "  - Good for: Production, commercial projects"
fi

echo ""
echo "Docker Username: $DOCKER_USERNAME"
echo "Image Tag: $IMAGE_TAG"
echo ""

read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

# Build images
print_info "Building production images..."
./scripts/docker/prod.sh build

# Tag images
print_info "Tagging images..."

# Web
docker tag shoptik-web:latest "$DOCKER_USERNAME/shoptik-web:$IMAGE_TAG"
print_success "Tagged: $DOCKER_USERNAME/shoptik-web:$IMAGE_TAG"

# NestJS
docker tag shoptik-prod-nestjs-service:latest "$DOCKER_USERNAME/shoptik-nestjs:$IMAGE_TAG"
print_success "Tagged: $DOCKER_USERNAME/shoptik-nestjs:$IMAGE_TAG"

# Go
docker tag shoptik-prod-go-service:latest "$DOCKER_USERNAME/shoptik-go:$IMAGE_TAG"
print_success "Tagged: $DOCKER_USERNAME/shoptik-go:$IMAGE_TAG"

# Push images
print_info "Pushing to Docker Hub..."

docker push "$DOCKER_USERNAME/shoptik-web:$IMAGE_TAG"
print_success "Pushed: shoptik-web"

docker push "$DOCKER_USERNAME/shoptik-nestjs:$IMAGE_TAG"
print_success "Pushed: shoptik-nestjs"

docker push "$DOCKER_USERNAME/shoptik-go:$IMAGE_TAG"
print_success "Pushed: shoptik-go"

echo ""
echo "=========================================="
print_success "All images pushed successfully!"
echo "=========================================="
echo ""
echo "Image URLs:"
echo "  $DOCKER_USERNAME/shoptik-web:$IMAGE_TAG"
echo "  $DOCKER_USERNAME/shoptik-nestjs:$IMAGE_TAG"
echo "  $DOCKER_USERNAME/shoptik-go:$IMAGE_TAG"
echo ""

if [ "$MODE" = "private" ]; then
    echo "=========================================="
    print_private "IMPORTANT: Private Images!"
    echo "=========================================="
    echo ""
    echo "You MUST create a Docker secret in Kubernetes:"
    echo ""
    echo "kubectl create secret docker-registry dockerhub-secret \\"
    echo "  --docker-server=https://index.docker.io/v1/ \\"
    echo "  --docker-username=$DOCKER_USERNAME \\"
    echo "  --docker-password=YOUR_PASSWORD \\"
    echo "  --docker-email=your@email.com \\"
    echo "  -n shoptik"
    echo ""
    echo "Then add to your deployment:"
    echo ""
    echo "spec:"
    echo "  imagePullSecrets:"
    echo "    - name: dockerhub-secret"
    echo ""
fi

echo "Next: Update your K8s deployments with the new image tags."
echo ""
