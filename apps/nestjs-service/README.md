# NestJS Service

Core API service for Shoptik — handles users, products, orders, and payments with PostgreSQL and Drizzle ORM.

## Stack

- **Runtime:** NestJS 11 + Node.js
- **Database:** PostgreSQL 17
- **ORM:** Drizzle ORM
- **Language:** TypeScript

## Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Service manifest |
| `GET` | `/health` | Service health |
| `GET` | `/health/db` | Database connectivity check |

## Environment

Copy `.env.example` to `.env` and configure:

```env
PORT=5001
DB_URL=postgresql://shoptik:shoptik_secret_password@localhost:5432/shoptik_db
```

## Development

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL running (use Docker Compose)

### Install Dependencies

```bash
pnpm install
```

### Start PostgreSQL

```bash
# From project root
cd ../../docker
docker compose up -d
```

### Generate Migrations

```bash
pnpm db:generate
```

### Run Migrations

```bash
pnpm db:migrate
```

### Run in Development

```bash
pnpm start:dev
```

Server runs at `http://localhost:5001`

## Production

### Build

```bash
pnpm build
```

### Run

```bash
pnpm start:prod
```

## Project Structure

```
nestjs-service/
├── src/
│   ├── main.ts               # Entry point
│   ├── app.module.ts         # Root module
│   ├── app.controller.ts     # Root controller
│   ├── db/
│   │   ├── index.ts          # Drizzle client
│   │   ├── db.module.ts      # DB module
│   │   ├── schemas/          # Table definitions
│   │   │   ├── users.ts
│   │   │   ├── addresses.ts
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   ├── order-items.ts
│   │   │   └── payments.ts
│   │   └── migrations/       # Generated migrations
│   └── health/               # Health module
│       ├── health.module.ts
│       ├── health.controller.ts
│       └── health.service.ts
├── .env
├── .env.example
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (role: USER/ADMIN) |
| `addresses` | User delivery addresses |
| `products` | Product catalog |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `payments` | Payment records |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm start:dev` | Run in dev mode (hot reload) |
| `pnpm build` | Build for production |
| `pnpm start:prod` | Run production build |
| `pnpm db:generate` | Generate migrations from schemas |
| `pnpm db:migrate` | Apply migrations to database |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint code |
