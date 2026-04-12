# Ingress Setup Guide

## No Port-Forward Needed!

With Kind configured with `hostPort`, services are accessible directly on localhost.

## Access Services Directly

```
http://web.shoptik.127.0.0.1.nip.io
http://api.shoptik.127.0.0.1.nip.io
http://go.shoptik.127.0.0.1.nip.io
```

---

## How It Works

Kind cluster is configured with:
```yaml
extraPortMappings:
  - containerPort: 30080
    hostPort: 80
```

And Ingress Controller pod uses:
```yaml
hostPort: 80
```

This makes port 80 on your Mac → Kind node → Ingress Controller → Your services.

---

## Test

```bash
curl http://web.shoptik.127.0.0.1.nip.io
curl http://api.shoptik.127.0.0.1.nip.io/health
curl http://go.shoptik.127.0.0.1.nip.io/health
```

---

## Alternative: Port-Forward via Ingress Controller

If you prefer using port-forwarding via Ingress Controller:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 6060:80
```

Then access at:
- http://web.shoptik.127.0.0.1.nip.io:6060
- http://api.shoptik.127.0.0.1.nip.io:6060
- http://go.shoptik.127.0.0.1.nip.io:6060

---

## If It Doesn't Work

You may need to recreate the Kind cluster with the new config:

```bash
# Delete existing cluster
kind delete cluster --name shoptik-cluster

# Create with new config
kind create cluster --config infra/k8s/kindCluster/Cluster.yaml

# Redeploy everything
./scripts/k8s/deploy.sh
```
