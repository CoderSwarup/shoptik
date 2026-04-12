# ============================================================================
# Kubernetes Dashboard Setup Script for Kind
# ============================================================================

# 1. Deploy Kubernetes Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# 2. Create admin user
kubectl apply -f infra/k8s/kindCluster/dashboard-admin.yaml

# 3. Get the login token (copy this token for login)
kubectl -n kubernetes-dashboard create token admin-user

# 4. Start kubectl proxy (keep this terminal open)
kubectl proxy

# 5. Open dashboard in browser
# http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

# ============================================================================
# ALTERNATIVE: Skip Proxy Method (for Kind)
# ============================================================================

# Update the dashboard service to NodePort
kubectl -n kubernetes-dashboard edit svc kubernetes-dashboard

# Change spec.type from ClusterIP to NodePort
# Then access via: http://localhost:NODE_PORT

# ============================================================================
# USEFUL COMMANDS
# ============================================================================

# Check dashboard pods
kubectl get pods -n kubernetes-dashboard

# View dashboard logs
kubectl logs -n kubernetes-dashboard -l k8s-app=kubernetes-dashboard

# Delete dashboard (if needed)
kubectl delete -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
