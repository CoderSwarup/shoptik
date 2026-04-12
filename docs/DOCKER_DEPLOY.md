# Docker Hub Deployment Guide

This guide explains how to build, push, and deploy Shoptik images to Docker Hub.

## Prerequisites

- Docker Hub account ([Sign up here](https://hub.docker.com/))
- Docker installed and running
- Access to push images to your Docker Hub namespace

---

## Public vs Private Images

### Public Images
- **Free** to use
- Anyone can pull without authentication
- No Docker secret needed in Kubernetes
- Good for: Open source projects, learning, public deployments

### Private Images
- **Paid** (Pro plan or Team plan required)
- Only you and your team can pull
- Requires Docker secret in Kubernetes
- Good for: Production, commercial projects, sensitive code

---

## Step 1: Login to Docker Hub

```bash
# Login to Docker Hub
docker login -u YOUR_DOCKER_USERNAME

# Enter password when prompted
```

---

## Step 2: Build Production Images

### Option A: Using the Production Script

```bash
# Build all production images
./scripts/docker/prod.sh build

# Build specific service
./scripts/docker/prod.sh build web
./scripts/docker/prod.sh build nestjs
./scripts/docker/prod.sh build go
```

### Option B: Manual Build

```bash
# Web (Next.js)
docker build -t shoptik-web:latest \
  -f apps/web/docker/Dockerfile.prod apps/web/

# NestJS Service
docker build -t shoptik-nestjs:latest \
  -f apps/nestjs-service/docker/Dockerfile.prod apps/nestjs-service/

# Go Service
docker build -t shoptik-go:latest \
  -f apps/go-service/docker/Dockerfile.prod apps/go-service/
```

---

## Step 3: Push to Docker Hub

### Option A: Public Images (No Auth Required)

Public images can be pulled by anyone without credentials.

```bash
# Tag as public
docker tag shoptik-web:latest YOUR_USERNAME/shoptik-web:latest
docker tag shoptik-nestjs:latest YOUR_USERNAME/shoptik-nestjs:latest
docker tag shoptik-go:latest YOUR_USERNAME/shoptik-go:latest

# Push (public by default if your repo is public)
docker push YOUR_USERNAME/shoptik-web:latest
docker push YOUR_USERNAME/shoptik-nestjs:latest
docker push YOUR_USERNAME/shoptik-go:latest
```

**To make public on Docker Hub:**
1. Go to your repository on Docker Hub
2. Settings → Visibility → Set to "Public"

---

### Option B: Private Images (Requires Auth)

Private images require Docker Hub Pro/Team plan.

```bash
# Tag as private
docker tag shoptik-web:latest YOUR_USERNAME/shoptik-web:latest
docker tag shoptik-nestjs:latest YOUR_USERNAME/shoptik-nestjs:latest
docker tag shoptik-go:latest YOUR_USERNAME/shoptik-go:latest

# Push (will be private if repo is private)
docker push YOUR_USERNAME/shoptik-web:latest
docker push YOUR_USERNAME/shoptik-nestjs:latest
docker push YOUR_USERNAME/shoptik-go:latest
```

**To make private on Docker Hub:**
1. Go to your repository on Docker Hub
2. Settings → Visibility → Set to "Private"

---

## Step 4: Verify Images on Docker Hub

Check your repositories at: `https://hub.docker.com/u/YOUR_USERNAME`

---

## Step 5: Check Repository Visibility (Public or Private)

### Option A: Docker Hub Website
Go to your repository page:
```
https://hub.docker.com/u/YOUR_USERNAME/shoptik-web
```

Look for the visibility badge:
- **PUBLIC** badge = Public repository
- **PRIVATE** badge = Private repository

### Option B: Docker CLI (Pull Test)

```bash
# Logout first to test without authentication
docker logout

# Try to pull the image
docker pull YOUR_USERNAME/shoptik-web:latest
```

- **If successful** = Public repository
- **If error "denied"** = Private repository

### Option C: Docker Hub API

```bash
# Get your access token from:
# https://hub.docker.com/settings/security

TOKEN="your_dockerhub_access_token"
USERNAME="your_username"
REPO="shoptik-web"

curl -s -H "Authorization: Bearer $TOKEN" \
  "https://hub.docker.com/v2/repositories/$USERNAME/$REPO/" | \
  grep -o '"is_private":[^,]*'
```

Output:
- `"is_private": false` = Public
- `"is_private": true` = Private

### Quick Summary

| Method | Command | Result |
|--------|---------|--------|
| Website | Visit `hub.docker.com/u/YOUR_USERNAME/shoptik-web` | Look for badge |
| Pull test | `docker pull YOUR_USERNAME/shoptik-web` | Works = Public, Error = Private |
| API | `curl` with token | Check `is_private` field |

---

## Kubernetes Deployment

### For Public Images

No Docker secret needed. Anyone can pull.

```yaml
# In your Deployment yaml
spec:
  containers:
    - name: nestjs
      image: YOUR_USERNAME/shoptik-nestjs:latest
```

Or via command:
```bash
kubectl set image deployment/nestjs-service nestjs=YOUR_USERNAME/shoptik-nestjs:latest -n shoptik
```

---

### For Private Images

Requires Docker registry secret.

#### 1. Create Docker Secret

```bash
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=YOUR_DOCKER_USERNAME \
  --docker-password=YOUR_DOCKER_PASSWORD_OR_TOKEN \
  --docker-email=YOUR_EMAIL \
  -n shoptik
```

#### 2. Add Secret to Deployment

```yaml
# In your Deployment yaml
spec:
  imagePullSecrets:
    - name: dockerhub-secret
  containers:
    - name: nestjs
      image: YOUR_USERNAME/shoptik-nestjs:latest
```

#### 3. Or Patch Service Account

```bash
kubectl patch serviceaccount default \
  -p '{"imagePullSecrets": [{"name": "dockerhub-secret"}]}' \
  -n shoptik
```

#### 4. Verify Secret

```bash
kubectl get secret dockerhub-secret -n shoptik
```

---

## Quick Push Script

Use the automated script with public/private option:

```bash
# Run the script - it will ask for public or private
./scripts/docker/push-to-hub.sh

# Or specify directly
./scripts/docker/push-to-hub.sh public
./scripts/docker/push-to-hub.sh private
```

---

## Full Deployment Workflow

### For Public Images

```bash
# 1. Login
docker login -u YOUR_USERNAME

# 2. Build
./scripts/docker/prod.sh build

# 3. Tag
docker tag shoptik-web:latest YOUR_USERNAME/shoptik-web:latest
docker tag shoptik-nestjs:latest YOUR_USERNAME/shoptik-nestjs:latest
docker tag shoptik-go:latest YOUR_USERNAME/shoptik-go:latest

# 4. Push
docker push YOUR_USERNAME/shoptik-web:latest
docker push YOUR_USERNAME/shoptik-nestjs:latest
docker push YOUR_USERNAME/shoptik-go:latest

# 5. Deploy (no secret needed)
kubectl set image deployment/nestjs-service nestjs=YOUR_USERNAME/shoptik-nestjs:latest -n shoptik
```

### For Private Images

```bash
# 1. Login
docker login -u YOUR_USERNAME

# 2. Build
./scripts/docker/prod.sh build

# 3. Tag
docker tag shoptik-web:latest YOUR_USERNAME/shoptik-web:latest
docker tag shoptik-nestjs:latest YOUR_USERNAME/shoptik-nestjs:latest
docker tag shoptik-go:latest YOUR_USERNAME/shoptik-go:latest

# 4. Push
docker push YOUR_USERNAME/shoptik-web:latest
docker push YOUR_USERNAME/shoptik-nestjs:latest
docker push YOUR_USERNAME/shoptik-go:latest

# 5. Create Docker Secret
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_PASSWORD \
  --docker-email=your@email.com \
  -n shoptik

# 6. Add secret to service account
kubectl patch serviceaccount default \
  -p '{"imagePullSecrets": [{"name": "dockerhub-secret"}]}' \
  -n shoptik

# 7. Deploy (imagePullSecrets in deployment or service account)
kubectl set image deployment/nestjs-service nestjs=YOUR_USERNAME/shoptik-nestjs:latest -n shoptik
```

---

## Load Image to Kind (Local Testing)

For Kind cluster, load images directly:

```bash
# For public images
kind load docker-image YOUR_USERNAME/shoptik-nestjs:latest --name shoptik-cluster

# For private images (after docker login)
kind load docker-image YOUR_USERNAME/shoptik-nestjs:latest --name shoptik-cluster
```

---

## Update Kubernetes Deployment

### Update Image

```bash
# Web
kubectl set image deployment/web web=YOUR_USERNAME/shoptik-web:latest -n shoptik

# NestJS
kubectl set image deployment/nestjs-service nestjs=YOUR_USERNAME/shoptik-nestjs:latest -n shoptik

# Go
kubectl set image deployment/go-service go=YOUR_USERNAME/shoptik-go:latest -n shoptik
```

### Rolling Update

```bash
kubectl rollout restart deployment/nestjs-service -n shoptik
kubectl rollout restart deployment/go-service -n shoptik
kubectl rollout restart deployment/web -n shoptik
```

### Check Status

```bash
kubectl rollout status deployment/nestjs-service -n shoptik
kubectl get pods -n shoptik
```

---

## Troubleshooting

### Image Pull Failed (Public)

```
Error: ImagePullBackOff
```

**Solution:** Image name might be wrong or doesn't exist.
```bash
docker pull YOUR_USERNAME/shoptik-nestjs:latest
```

### Image Pull Failed (Private)

```
denied: requested access to the resource is denied
```

**Solution:** Docker secret is missing or wrong.
```bash
# Check secret exists
kubectl get secret dockerhub-secret -n shoptik

# Delete and recreate if needed
kubectl delete secret dockerhub-secret -n shoptik
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_PASSWORD \
  --docker-email=YOUR@EMAIL.com \
  -n shoptik
```

### Authentication Failed

```bash
# Re-login
docker logout
docker login -u YOUR_USERNAME
```

---

## Repository Structure

```
YOUR_USERNAME/shoptik-web:latest
YOUR_USERNAME/shoptik-web:v1.0.0

YOUR_USERNAME/shoptik-nestjs:latest
YOUR_USERNAME/shoptik-nestjs:v1.0.0

YOUR_USERNAME/shoptik-go:latest
YOUR_USERNAME/shoptik-go:v1.0.0
```

---

## Security Best Practices

1. **Use Access Tokens** instead of password
   - Go to Docker Hub → Account Settings → Security → New Access Token

2. **Enable 2FA** on Docker Hub

3. **Use specific tags** in production (not `latest`)
   - `v1.0.0`, `v1.1.0`, etc.

4. **Private for production** - Use private repos for commercial projects

5. **Scan images** for vulnerabilities:
   ```bash
   docker scout scan YOUR_USERNAME/shoptik-nestjs:latest
   ```

6. **Regularly update** base images
