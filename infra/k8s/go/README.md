# Go Service

## Files
- `deployment.yaml` - Deployment with 2 replicas
- `service.yaml` - ClusterIP service (HTTP:5002, gRPC:5003)
- `configmap.yaml` - Environment configuration

## Deploy

```bash
kubectl apply -f infra/k8s/go/
```

## Port Forward & Access

### Port Forward (HTTP)
```bash
kubectl port-forward svc/go-service 5002:5002 -n shoptik
```

### Access Health
```bash
# Health check
curl http://localhost:5002/health

# Database health
curl http://localhost:5002/health/db
```

### WebSocket
```bash
# Connect to WebSocket
ws://localhost:5002/ws
```

### View Logs
```bash
kubectl logs -l app.kubernetes.io/name=go-service -n shoptik -f
```

### Check Status
```bash
kubectl get pods -l app.kubernetes.io/name=go-service -n shoptik
```

## Ports
- HTTP: 5002
- gRPC: 5003

## Service Connections
- MongoDB: `mongodb:27017`
- Redis: `redis:6379`
