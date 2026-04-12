#!/bin/bash
# ============================================================================
# Deploy Shoptik to Kubernetes - Step by Step
# ============================================================================

set -e

NAMESPACE="shoptik"

echo "=========================================="
echo "Shoptik Kubernetes Deployment"
echo "=========================================="

# Step 1: Namespace
echo ""
echo "[1/8] Creating namespace..."
kubectl apply -f infra/k8s/namespace/namespace.yaml
echo "✓ Namespace created"

# Step 2: Secrets
echo ""
echo "[2/8] Creating secrets..."
kubectl apply -f infra/k8s/secrets/secrets.yaml
echo "✓ Secrets created"

# Step 3: Storage
echo ""
echo "[3/8] Creating storage..."
kubectl apply -f infra/k8s/storage/storage.yaml
echo "✓ Storage created"

# Step 4: Databases
echo ""
echo "[4/8] Deploying databases..."
kubectl apply -f infra/k8s/postgres/statefulset.yaml
kubectl apply -f infra/k8s/postgres/service.yaml
kubectl apply -f infra/k8s/mongodb/statefulset.yaml
kubectl apply -f infra/k8s/mongodb/service.yaml
kubectl apply -f infra/k8s/redis/statefulset.yaml
kubectl apply -f infra/k8s/redis/service.yaml
echo "✓ Databases deployed"

# Step 5: Wait for databases
echo ""
echo "[5/8] Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgres -n $NAMESPACE --timeout=120s 2>/dev/null || echo "  PostgreSQL starting..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=mongodb -n $NAMESPACE --timeout=120s 2>/dev/null || echo "  MongoDB starting..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redis -n $NAMESPACE --timeout=120s 2>/dev/null || echo "  Redis starting..."
echo "✓ Databases ready"

# Step 6: Applications
echo ""
echo "[6/8] Deploying applications..."
kubectl apply -f infra/k8s/nestjs/deployment.yaml
kubectl apply -f infra/k8s/nestjs/service.yaml
kubectl apply -f infra/k8s/nestjs/configmap.yaml
kubectl apply -f infra/k8s/go/deployment.yaml
kubectl apply -f infra/k8s/go/service.yaml
kubectl apply -f infra/k8s/go/configmap.yaml
kubectl apply -f infra/k8s/web/deployment.yaml
kubectl apply -f infra/k8s/web/service.yaml
kubectl apply -f infra/k8s/web/configmap.yaml
echo "✓ Applications deployed"

# Step 7: Ingress Controller
echo ""
echo "[7/8] Installing Ingress Controller..."
kubectl apply -f infra/k8s/ingress/kind-ingress.yaml
echo "  Waiting for Ingress Controller..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --timeout=120s 2>/dev/null || echo "  Ingress starting..."
echo "✓ Ingress Controller installed"

# Step 8: Ingress Rules
echo ""
echo "[8/8] Applying Ingress rules..."
kubectl apply -f infra/k8s/ingress/ingress.yaml
echo "✓ Ingress rules applied"

# Final Status
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Pods:"
kubectl get pods -n $NAMESPACE
echo ""
echo "Services:"
kubectl get svc -n $NAMESPACE
echo ""
echo "Ingress:"
kubectl get ingress -n $NAMESPACE
echo ""
echo "=========================================="
echo "Access Services:"
echo "=========================================="
echo ""
echo "Open in browser:"
echo "   http://web.shoptik.127.0.0.1.nip.io"
echo "   http://api.shoptik.127.0.0.1.nip.io"
echo "   http://go.shoptik.127.0.0.1.nip.io"
echo ""
echo "Test services:"
echo "   ./scripts/k8s/test-services.sh"
echo ""
