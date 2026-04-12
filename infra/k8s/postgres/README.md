# PostgreSQL Migration Guide

## Option 1: Manual Local Migration (Recommended for Development)

### Step 1: Port-forward PostgreSQL

```bash
kubectl port-forward svc/postgres 5432:5432 -n shoptik
```

### Step 2: Run Migrations

```bash
cd apps/nestjs-service
export DB_URL="postgresql://shoptik:admin123@localhost:5432/shoptik_db"
pnpm db:migrate
```

---

## Option 2: Use Migration Job (For Production)

Apply the migration job before deploying the app:

```bash
kubectl apply -f infra/k8s/postgres/migration-job.yaml

# Watch the job
kubectl get job nestjs-migration -n shoptik -w

# Check logs
kubectl logs job/nestjs-migration -n shoptik
```

---

## Option 3: One-liner Script

Run the script:

```bash
chmod +x scripts/k8s-migrate.sh
./scripts/k8s-migrate.sh
```

---

## Access PostgreSQL Pod

### Exec into the Pod

```bash
kubectl exec -it postgres-0 -n shoptik -- psql -U shoptik -d shoptik_db
```

### Common SQL Commands (inside pod)

```sql
-- List all tables
\dt

-- List all schemas
\dn

-- List all databases
\l

-- List all users/roles
\du

-- Describe a table
\d users

-- Exit
\q
```

---

## Verify Migrations

### Option 1: Exec into Postgres Pod (Recommended)

```bash
kubectl exec -it postgres-0 -n shoptik -- psql -U shoptik -d shoptik_db -c '\dt'
```

### Option 2: Create temporary client pod

```bash
# Delete existing if exists
kubectl delete pod pg-client -n shoptik --force --ignore-not-found

# Run new client
kubectl run pg-client --rm -it --image=postgres:17 -n shoptik -- \
  psql -h postgres -U shoptik -d shoptik_db -c '\dt'
```

---

## Clear/Reset Database (Drop All Tables)

### Step 1: Exec into PostgreSQL Pod

```bash
kubectl exec -it postgres-0 -n shoptik -- psql -U shoptik -d shoptik_db
```

### Step 2: Drop All Tables and Drizzle Schema

```sql
-- List all schemas (to see what exists)
\dn

-- List all tables first
\dt

-- IMPORTANT: Drizzle creates a separate "drizzle" schema
-- We need to drop BOTH public AND drizzle schemas

DROP SCHEMA public CASCADE;
DROP SCHEMA drizzle CASCADE;

-- Recreate empty public schema
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO shoptik;
GRANT ALL ON SCHEMA public TO public;

-- Verify schemas are clean
\dn
\dt
```

**What this removes:**
- `public` schema: All tables (users, addresses, products, orders, etc.)
- `public` schema: All types (user_role, order_status, payment_status, etc.)
- `drizzle` schema: The `__drizzle_migrations` table

### Step 3: Exit

```sql
\q
```

### Step 4: Re-run Migrations

```bash
cd apps/nestjs-service
export DB_URL="postgresql://shoptik:admin123@localhost:5432/shoptik_db"
pnpm db:migrate
```

---

## Quick Reset (One-liner)

Drop all tables and Drizzle schema without entering interactive mode:

```bash
kubectl exec -it postgres-0 -n shoptik -- psql -U shoptik -d shoptik_db -c \
  "DROP SCHEMA public CASCADE; DROP SCHEMA drizzle CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO shoptik; GRANT ALL ON SCHEMA public TO public;"
```

This removes:
- All tables (public schema)
- All types (public schema)
- Drizzle `__drizzle_migrations` table (drizzle schema)

---

## Run Drizzle Commands Inside Pod

### Generate Migrations

```bash
kubectl exec -it postgres-0 -n shoptik -- sh -c \
  "cd /app && npx drizzle-kit generate"
```

### Drop All Tables (drizzle-kit)

```bash
kubectl exec -it postgres-0 -n shoptik -- sh -c \
  "cd /app && npx drizzle-kit drop"
```

### Push Schema (alternative to migrate)

```bash
kubectl exec -it postgres-0 -n shoptik -- sh -c \
  "cd /app && npx drizzle-kit push"
```

---

## Troubleshooting

### Connection refused

Make sure PostgreSQL pod is running:

```bash
kubectl get pods -n shoptik
```

### Auth failed

Check secrets are correct:

```bash
kubectl get secret shoptik-db-secrets -n shoptik -o yaml
```

### Migration already exists

Use `--force` flag:

```bash
npx drizzle-kit migrate --force
```

### Pod stuck or error

Check pod logs:

```bash
kubectl logs postgres-0 -n shoptik
kubectl describe pod postgres-0 -n shoptik
```

---

## ⚠️ WARNING

- `DROP SCHEMA public CASCADE` deletes ALL data
- Only use for development/reset
- For production, backup data first
