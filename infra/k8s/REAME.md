# Kubernetes (K8s) Infrastructure

This directory contains Kubernetes manifests and cluster configurations for deploying the Shoptik application.

## What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform that automates:
- Deploying containerized applications
- Scaling and load balancing
- Managing container networking
- Rolling updates and rollbacks
- Self-healing (restarts failed containers)

## Directory Structure

```
infra/k8s/
├── REAME.md                    # This file
├── kindCluster/
│   ├── REAME.md               # Kind cluster setup guide
│   └── Cluster.yaml           # Local development cluster config
└── services/                   # K8s manifests (deployments, services, etc.)
```

## Prerequisites

### Install kubectl

**macOS:**
```bash
brew install kubectl
kubectl version --client
```

**Linux:**
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/
```

**Windows:**
```powershell
choco install kubernetes-cli
# or
winget install Kubernetes.kubectl
```

### Install Docker

Docker is required for containerized applications:

**macOS/Windows:** Install [Docker Desktop](https://docker.com/products/docker-desktop)

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
```

### Optional: Install Kind

For local development clusters:

**macOS:** `brew install kind`
**Linux:** `curl -Lo kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64 && chmod +x kind && sudo mv kind /usr/local/bin/`
**Windows:** `choco install kind`

## Basic kubectl Commands

### Cluster Info
```bash
kubectl cluster-info              # Show cluster endpoints
kubectl version                  # Show kubectl and cluster versions
kubectl config current-context   # Show current context
kubectl config get-contexts      # List all contexts
```

### Get Resources
```bash
kubectl get nodes                # List all nodes
kubectl get pods                 # List pods in default namespace
kubectl get pods -A              # List pods in all namespaces
kubectl get svc                  # List services
kubectl get svc -A               # List all services
kubectl get deployments          # List deployments
kubectl get all                  # List all resources
```

### Apply & Delete
```bash
kubectl apply -f <file.yaml>     # Apply manifest
kubectl apply -f <directory/>    # Apply all manifests in directory
kubectl delete -f <file.yaml>    # Delete resources
kubectl delete -A -f <file.yaml> # Delete from all namespaces
```

### Debugging
```bash
kubectl describe pod <name>      # Describe pod details
kubectl logs <pod-name>          # View pod logs
kubectl logs -f <pod-name>       # Follow logs
kubectl exec -it <pod> -- /bin/sh # Shell into pod
kubectl port-forward svc/<svc> 8080:80  # Port forward
```

### Namespaces
```bash
kubectl create namespace <name>   # Create namespace
kubectl get namespaces           # List namespaces
kubectl config set-context --current --namespace=<name>  # Set default namespace
```

## Quick Start

### 1. Start Local Cluster (Kind)
```bash
cd kindCluster
kind create cluster --config Cluster.yaml
kubectl get nodes
```

### 2. Deploy Application
```bash
# Deploy all services
kubectl apply -f services/

# Check status
kubectl get pods -n shoptik
kubectl get svc -n shoptik
```

### 3. Access Services
```bash
# Port forward web service to localhost:3000
kubectl port-forward svc/web 3000:80 -n shoptik
```

### 4. Clean Up
```bash
kind delete cluster
```

## Useful Links

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- [Kind Documentation](https://kind.sigs.k8s.io/)
