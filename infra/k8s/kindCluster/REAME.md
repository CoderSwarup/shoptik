# K8s Kind Cluster Setup

## What is Kind?

Kind (Kubernetes IN Docker) is a tool for running local Kubernetes clusters
using Docker containers as cluster nodes. It's perfect for local development and
testing.

## Prerequisites

### Install kubectl

**macOS:**

```bash
# with Homebrew
brew install kubectl

# Verify installation
kubectl version --client
```

**Linux:**

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

**Windows:**

```powershell
# with Chocolatey
choco install kubernetes-cli

# or with Winget
winget install Kubernetes.kubectl

# or manually - download from: https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe
# Then add to your PATH

# Verify installation
kubectl version --client
```

### Install Kind

**macOS:**

```bash
# with Homebrew
brew install kind

# Verify installation
kind version
```

**Linux:**

```bash
curl -Lo kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x kind
sudo mv kind /usr/local/bin/
kind version
```

**Windows:**

```powershell
# with Chocolatey
choco install kind

# or with Winget
winget install Kubernetes.Kind

# or manually - download from: https://kind.sigs.k8s.io/dl/v0.20.0/kind-windows-amd64.exe
# Rename to kind.exe and add to PATH

# Verify installation
kind version
```

### Additional Windows Requirements

For Kind on Windows, you need either:

- **Docker Desktop** with WSL2 enabled
- **Minikube** with Docker driver
- **Hyper-V** with Docker containers enabled

```powershell
# Check if Docker is running
docker info

# Create cluster (uses Docker Desktop backend)
kind create cluster --config Cluster.yaml
```

## Cluster Configuration

The cluster is defined in `Cluster.yaml`:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: shoptik-cluster
nodes:
    - role: control-plane # Main cluster control plane
    - role: worker # Worker node 1
    - role: worker # Worker node 2
```

### Customizing the Cluster

**Change cluster name:**

```yaml
name: your-custom-name
```

**Add more worker nodes:**

```yaml
nodes:
    - role: control-plane
    - role: worker
    - role: worker
    - role: worker # Add more workers like this
```

**Add extra port mappings (for local ingress):**

```yaml
nodes:
    - role: control-plane
      extraPortMappings:
          - containerPort: 80
            hostPort: 80
            protocol: TCP
          - containerPort: 443
            hostPort: 443
            protocol: TCP
```

**Add extra mounts (for persistent storage):**

```yaml
nodes:
    - role: control-plane
      extraMounts:
          - hostPath: /path/on/host
            containerPath: /path/in/container
            readOnly: true
```

## Create Cluster

```bash
# Create cluster from config file
kind create cluster --config Cluster.yaml

# Create with custom name
kind create cluster --name my-cluster --config Cluster.yaml

# Wait for cluster to be ready
kubectl cluster-info --context kind-shoptik-cluster
```

## Useful Kind Commands

```bash
# List all clusters
kind get clusters

# Get cluster info
kind get nodes --name shoptik-cluster

# Delete cluster
kind delete cluster --name shoptik-cluster

# Delete all clusters
kind delete clusters --all

# Load docker image into cluster (useful for local images)
kind load docker-image myapp:latest --name shoptik-cluster

# Export kubeconfig
kind get kubeconfig --name shoptik-cluster > ~/.kube/config

# Check cluster is running
kubectl get nodes
```

## Basic Kubectl Commands

### Context & Cluster Commands

```bash
# Show current context (cluster + namespace)
kubectl config current-context

# List all contexts
kubectl config get-contexts

# List all clusters
kubectl config get-clusters

# Switch context
kubectl config use-context <context-name>

# Example: switch to kind cluster
kubectl config use-context kind-shoptik-cluster

# View kubeconfig file location
kubectl config view --minify

# Show full kubeconfig
kubectl config view

# Delete a context
kubectl config delete-context <context-name>

# Rename a context
kubectl config rename-context <old-name> <new-name>

# Get cluster info (current context)
kubectl cluster-info

# Get cluster info for specific context
kubectl cluster-info --context <context-name>
```

### Get Resources

```bash
# Get all nodes
kubectl get nodes

# Get all pods (all namespaces)
kubectl get pods -A

# Get all services
kubectl get svc -A

# Get all deployments
kubectl get deployments -A

# Get all resources
kubectl get all -A

# Describe a pod (debugging)
kubectl describe pod <pod-name> -n <namespace>

# View pod logs
kubectl logs <pod-name> -n <namespace>

# Follow logs in real-time
kubectl logs -f <pod-name> -n <namespace>

# Execute into a pod
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh

# Apply configuration
kubectl apply -f <file.yaml>

# Delete resources
kubectl delete -f <file.yaml>

# Watch resources
kubectl get pods -A -w

# Port forward to local machine
kubectl port-forward svc/<service-name> 8080:80 -n <namespace>

# Get resource usage
kubectl top nodes
kubectl top pods -A
```

## Troubleshooting

```bash
# Check Kind cluster logs
docker logs kind-control-plane

# Restart cluster
kind delete cluster --name shoptik-cluster
kind create cluster --config Cluster.yaml

# Reset Docker and retry
docker system prune -a
kind delete clusters --all
kind create cluster --config Cluster.yaml
```
