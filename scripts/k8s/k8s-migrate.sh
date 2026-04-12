#!/bin/bash
# ============================================================================
# PostgreSQL Migration Script for Shoptik (Kubernetes)
# ============================================================================

set -e

NAMESPACE="shoptik"
POSTGRES_SECRET="shoptik-db-secrets"
PF_PID=""

cleanup() {
    if [ -n "$PF_PID" ] && kill -0 "$PF_PID" 2>/dev/null; then
        echo "Stopping port-forward..."
        kill "$PF_PID" 2>/dev/null || true
        wait "$PF_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Get credentials from Kubernetes Secret
echo "Fetching database credentials..."

DB_HOST=$(kubectl get secret $POSTGRES_SECRET -n $NAMESPACE -o jsonpath='{.data.postgres-host}' 2>/dev/null | base64 -d)
DB_PORT="5432"
DB_USER=$(kubectl get secret $POSTGRES_SECRET -n $NAMESPACE -o jsonpath='{.data.postgres-username}' 2>/dev/null | base64 -d)
DB_PASSWORD=$(kubectl get secret $POSTGRES_SECRET -n $NAMESPACE -o jsonpath='{.data.postgres-password}' 2>/dev/null | base64 -d)
DB_NAME=$(kubectl get secret $POSTGRES_SECRET -n $NAMESPACE -o jsonpath='{.data.postgres-database}' 2>/dev/null | base64 -d)

# Fallback to direct values
if [ -z "$DB_USER" ]; then
    DB_USER="shoptik"
    DB_PASSWORD="admin123"
    DB_NAME="shoptik_db"
fi

# Get project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT/apps/nestjs-service"

echo ""
echo "=========================================="
echo "Database Migration Tool"
echo "=========================================="
echo "Host: ${DB_HOST:-postgres}:${DB_PORT}"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "=========================================="
echo ""
echo "Option 1: Run migrations with port-forward (auto)"
echo "Option 2: Run migrations with direct cluster access"
echo ""
read -p "Choose option (1/2): " choice

case $choice in
    1)
        echo ""
        echo "Checking port-forward status..."
        
        # Check if port-forward is already running
        if lsof -i :5432 2>/dev/null | grep -q "LISTEN"; then
            echo "✓ Port 5432 is already forwarded"
        else
            echo "Starting port-forward..."
            kubectl port-forward svc/postgres 5432:5432 -n $NAMESPACE &
            PF_PID=$!
            
            echo "Waiting for port-forward to be ready..."
            for i in {1..10}; do
                if nc -z localhost 5432 2>/dev/null; then
                    echo "✓ Port-forward ready"
                    break
                fi
                if [ $i -eq 10 ]; then
                    echo "✗ Failed to start port-forward"
                    exit 1
                fi
                sleep 1
            done
        fi
        
        export DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
        echo ""
        echo "Running migrations..."
        pnpm db:migrate
        ;;
    2)
        echo ""
        echo "Running migrations with direct cluster access..."
        export DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST:-postgres}:${DB_PORT}/${DB_NAME}"
        pnpm db:migrate
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Migration completed!"
echo "=========================================="
