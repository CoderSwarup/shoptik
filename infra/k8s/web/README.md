# Web Service (Next.js Frontend)

## Files
- `deployment.yaml` - Deployment with 2 replicas
- `service.yaml` - ClusterIP service on port 80 → 3000
- `configmap.yaml` - Environment configuration

## Deploy

```bash
kubectl apply -f infra/k8s/web/
```

## Port Forward & Access

### Port Forward
```bash
kubectl port-forward svc/web 3000:80 -n shoptik
```

### Access Frontend
```bash
# Open in browser
http://localhost:3000
```

### View Logs
```bash
kubectl logs -l app.kubernetes.io/name=web -n shoptik -f
```

### Check Status
```bash
kubectl get pods -l app.kubernetes.io/name=web -n shoptik
```

## Service Connections
- NestJS API: `http://nestjs-service:5001`
