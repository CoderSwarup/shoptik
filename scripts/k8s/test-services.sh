#!/bin/bash
# ============================================================================
# Test Shoptik Services
# ============================================================================

echo "=========================================="
echo "Testing Shoptik Services"
echo "=========================================="

# Kill any existing port-forwards on port 6060
pkill -f "kubectl port-forward.*6060" 2>/dev/null || true

# Test via port-forward
echo ""
echo "Starting port-forward to Ingress Controller on port 6060..."
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 6060:80 &
PF_PID=$!
sleep 3

cleanup() {
    if [ -n "$PF_PID" ]; then
        kill $PF_PID 2>/dev/null || true
    fi
}
trap cleanup EXIT

# Test Web
echo ""
echo "[1/3] Testing Web (Frontend)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://web.shoptik.127.0.0.1.nip.io:6060/ 2>/dev/null || echo "000")
echo "  web.shoptik.127.0.0.1.nip.io:6060 - HTTP $HTTP_CODE"

# Test API
echo ""
echo "[2/3] Testing API (NestJS)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://api.shoptik.127.0.0.1.nip.io:6060/health 2>/dev/null || echo "000")
echo "  api.shoptik.127.0.0.1.nip.io:6060/health - HTTP $HTTP_CODE"

# Test Go Service
echo ""
echo "[3/3] Testing Go Service..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://go.shoptik.127.0.0.1.nip.io:6060/health 2>/dev/null || echo "000")
echo "  go.shoptik.127.0.0.1.nip.io:6060/health - HTTP $HTTP_CODE"

echo ""
echo "=========================================="
echo "Tests Complete!"
echo "=========================================="
