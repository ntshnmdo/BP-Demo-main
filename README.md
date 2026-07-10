# Battery Passport Platform 🔋

A web application that enables stakeholders to **create, manage, approve, and publicly view Battery Passports** in accordance with the EU Battery Passport concept.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Backend | NestJS, TypeScript, REST API |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT (custom) |
| Monorepo | Turborepo |

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (or Docker)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd battery-passport
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up postgres -d

# Run migrations
cd apps/backend
npx prisma migrate dev

# Seed demo data
npx prisma db seed
```

### 4. Start Development

```bash
# From root — starts both frontend and backend
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@goodenergy.com | Admin@123 |
| Manufacturer | manufacturer@goodenergy.com | Mfr@123 |
| Testing Lab | lab@goodenergy.com | Lab@123 |
| Sustainability | sustain@goodenergy.com | Sus@123 |
| Material Supplier | supplier@goodenergy.com | Sup@123 |

## Project Structure

```
battery-passport/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   └── backend/           # NestJS REST API
├── packages/
│   └── shared/            # Shared TypeScript types
├── docker-compose.yml
├── turbo.json
└── .env.example
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in development |
| `npm run build` | Build all apps |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Blockchain Layer

The MVP uses `MockBlockchainService` which stores hashes in PostgreSQL.
To switch to ADI Chain, implement `AdiChainBlockchainService` and update the provider in `blockchain.module.ts`.

## License

© Battery Passport Platform. All rights reserved.
