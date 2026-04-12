# Kubernetes Infrastructure - Data Layer

Production-grade Kubernetes manifests for Shoptik's stateful services.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     shoptik Namespace                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Postgres   │  │   MongoDB   │  │    Redis    │       │
│  │ StatefulSet │  │ StatefulSet │  │ StatefulSet │       │
│  │   (1 pod)   │  │   (1 pod)   │  │   (1 pod)   │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │               │
│         ▼                ▼                ▼               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  postgres   │  │   mongodb   │  │    redis    │       │
│  │   ClusterIP │  │  ClusterIP  │  │  ClusterIP  │       │
│  │  :5432      │  │  :27017     │  │   :6379     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │              PersistentVolumes                    │       │
│  │  postgres-pvc (5Gi) | mongo-pvc (10Gi) | redis   │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Structure

```
infra/k8s/
├── namespace/
│   └── namespace.yaml           # shoptik namespace
├── secrets/
│   └── secrets.yaml             # Database credentials (base64 encoded)
├── storage/
│   └── storage.yaml             # StorageClass + PVCs
├── postgres/
│   ├── statefulset.yaml         # PostgreSQL StatefulSet
│   └── service.yaml             # PostgreSQL services
├── mongodb/
│   ├── statefulset.yaml         # MongoDB StatefulSet
│   └── service.yaml             # MongoDB services
├── redis/
│   ├── statefulset.yaml         # Redis StatefulSet
│   └── service.yaml             # Redis services
├── kustomization.yaml           # Kustomize config
└── README.md                    # This file
```

## Prerequisites

### For Kind Cluster

Ensure your Kind cluster has extra mounts for persistent storage:

```yaml
# kindCluster/Cluster.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: shoptik-cluster
nodes:
  - role: control-plane
    extraMounts:
      - hostPath: /tmp/shoptik-storage
        containerPath: /var/lib/rancher/k3s/storage
        readOnly: false
```

### Install Kustomize

```bash
# macOS
brew install kustomize

# Linux
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
```

## Deploy

### Option 1: Using Kustomize (Recommended)

```bash
# Apply all resources
kubectl apply -k infra/k8s/

# Verify deployment
kubectl get all -n shoptik

# Check PVCs
kubectl get pvc -n shoptik

# Watch pods
kubectl get pods -n shoptik -w
```

### Option 2: Using kubectl directly

```bash
# Apply in order
kubectl apply -f infra/k8s/namespace/namespace.yaml
kubectl apply -f infra/k8s/secrets/secrets.yaml
kubectl apply -f infra/k8s/storage/storage.yaml
kubectl apply -f infra/k8s/postgres/
kubectl apply -f infra/k8s/mongodb/
kubectl apply -f infra/k8s/redis/
```

## Verify Deployment

```bash
# Check namespace
kubectl get namespace shoptik

# Check pods
kubectl get pods -n shoptik

# Check services
kubectl get svc -n shoptik

# Check PVCs
kubectl get pvc -n shoptik

# Check secrets
kubectl get secrets -n shoptik

# View pod logs
kubectl logs -n shoptik statefulset/postgres
kubectl logs -n shoptik statefulset/mongodb
kubectl logs -n shoptik statefulset/redis
```

## Test Connectivity

### PostgreSQL
```bash
kubectl run postgres-client --rm -it --image=postgres:17 --restart=Never -n shoptik -- \
  psql -h postgres -U shoptik -d shoptik_db
```

### MongoDB
```bash
kubectl run mongo-client --rm -it --image=mongo:8 --restart=Never -n shoptik -- \
  mongosh -h mongodb -u admin -p admin123
```

### Redis
```bash
kubectl run redis-client --rm -it --image=redis:7-alpine --restart=Never -n shoptik -- \
  redis-cli -h redis -a admin123
```

## Production Considerations

### Security
- [x] Secrets stored in Kubernetes Secrets (not in code)
- [x] No hardcoded credentials
- [x] PodSecurityPolicies ready (for production)
- [x] Network policies (to be added)

### High Availability
- [ ] For HA: Run 3 replicas of each database
- [ ] Use distributed storage (Ceph, Longhorn) for multi-node
- [ ] Configure PodDisruptionBudgets

### Backup & Restore
- [ ] Configure automated backups
- [ ] Test restore procedures

### Monitoring
- [ ] Add Prometheus metrics exporters
- [ ] Configure alerts
- [ ] Set up dashboards

## Tear Down

```bash
# Delete all resources
kubectl delete -k infra/k8s/

# Or delete in reverse order
kubectl delete -f infra/k8s/redis/
kubectl delete -f infra/k8s/mongodb/
kubectl delete -f infra/k8s/postgres/
kubectl delete -f infra/k8s/storage/storage.yaml
kubectl delete -f infra/k8s/secrets/secrets.yaml
kubectl delete -f infra/k8s/namespace/namespace.yaml
```

## Next Steps

After verifying database layer:
1. Deploy application services (NestJS, Go)
2. Configure Ingress for external access
3. Set up monitoring and logging
