# NestJS Service

## Files
- `deployment.yaml` - Deployment with 2 replicas
- `service.yaml` - ClusterIP service on port 5001
- `configmap.yaml` - Environment configuration

## Deploy

```bash
kubectl apply -f infra/k8s/nestjs/
```

## Port Forward & Access

### Port Forward
```bash
kubectl port-forward svc/nestjs-service 5001:5001 -n shoptik
```

### Access API
```bash
# Health check
curl http://localhost:5001/health

# API endpoints
curl http://localhost:5001/products
curl http://localhost:5001/auth/login
```

### View Logs
```bash
kubectl logs -l app.kubernetes.io/name=nestjs-service -n shoptik -f
```

### Check Status
```bash
kubectl get pods -l app.kubernetes.io/name=nestjs-service -n shoptik
```

## Service Connections
- PostgreSQL: `postgres:5432`
- Redis: `redis:6379`
- Go Service: `go-service:5003`
