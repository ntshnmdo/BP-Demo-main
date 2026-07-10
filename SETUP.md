# 🚀 Battery Passport Platform — Developer Setup Guide

> Complete step-by-step guide to get the project running locally from scratch.

---

## ✅ Prerequisites

Before starting, make sure you have the following installed:

| Tool | Minimum Version | Check with |
|------|----------------|-----------|
| **Node.js** | v18 or higher | `node --version` |
| **npm** | v9 or higher | `npm --version` |
| **PostgreSQL** | v14 or higher | `psql --version` |
| **Git** | Any recent | `git --version` |

> **No PostgreSQL?** Use Docker instead — see the [Docker option](#-option-b-using-docker-for-the-database) below.

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/Mohith-esyasoft/BP-Demo.git
cd BP-Demo
```

---

## ⚙️ Step 2 — Install Dependencies

Run this **once** from the project root. It installs packages for every app (frontend + backend) at the same time:

```bash
npm install
```

---

## 🔐 Step 3 — Set Up Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and make sure these values are correct for your machine:

```env
# ─── Database ────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/battery_passport"

# ─── JWT ─────────────────────────────────────────────────────
JWT_SECRET="battery-passport-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# ─── App Ports ───────────────────────────────────────────────
BACKEND_PORT=3001
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# ─── File Storage ────────────────────────────────────────────
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=10

# ─── Blockchain (MVP mock mode) ──────────────────────────────
BLOCKCHAIN_PROVIDER="mock"
NODE_ENV="development"
```

> ⚠️ **Important:** Change `DATABASE_URL` username/password to match your local PostgreSQL setup if they differ from the defaults.

---

## 🗄️ Step 4 — Set Up the Database

### Option A: Using a local PostgreSQL installation

**1. Create the database:**
```bash
psql -U postgres -c "CREATE DATABASE battery_passport;"
```

**2. Run migrations (creates all tables):**
```bash
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma
```

**3. Seed the database with demo data:**
```bash
npx prisma db seed --schema=apps/backend/prisma/schema.prisma
```

---

### Option B: Using Docker for the Database

If you have Docker installed, this is the easiest option — no PostgreSQL installation needed:

**1. Start only the Postgres container:**
```bash
docker compose up postgres -d
```

**2. Wait ~5 seconds for it to be ready, then run migrations:**
```bash
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma
```

**3. Seed the database:**
```bash
npx prisma db seed --schema=apps/backend/prisma/schema.prisma
```

---

## ▶️ Step 5 — Start the Development Servers

Run both the frontend and backend together with a single command:

```bash
npm run dev
```

This uses **Turborepo** to start:
- 🌐 **Frontend** → http://localhost:3000
- 🔌 **Backend API** → http://localhost:3001/api

> Both servers have **hot reload** — file changes reflect instantly without restarting.

---

## 🔑 Step 6 — Log In

Open http://localhost:3000 in your browser.

Use one of these pre-seeded demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@batterypassport.eu` | `Password123!` |
| **Manufacturer** | `manufacturer@voltaics.de` | `Password123!` |
| **Lab** | `lab@testlab.eu` | `Password123!` |
| **Sustainability** | `sustainability@ecopower.nl` | `Password123!` |

---

## 🛠️ Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start frontend + backend in dev mode |
| `npm run build` | Build both apps for production |
| `npx prisma studio --schema=apps/backend/prisma/schema.prisma` | Open Prisma Studio (visual DB browser) |
| `npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma` | Run new DB migrations |
| `npx prisma db seed --schema=apps/backend/prisma/schema.prisma` | Re-seed demo data |

---

## 🌍 Step 7 (Optional) — Share Locally via Public Tunnel

To test on mobile or share with someone over the internet, use Pinggy:

```bash
ssh -p 443 -R 80:localhost:3000 a.pinggy.io
```

> This tunnels your local port 3000 to a public URL. Use port **443** (not 22) — this bypasses most corporate/home network firewalls.

---

## ❌ Common Issues & Fixes

### `Cannot connect to database`
- Make sure PostgreSQL is running: `pg_isready -U postgres`
- Double-check your `DATABASE_URL` in `.env`
- If using Docker, run `docker compose up postgres -d` first

### `Port 3000 or 3001 already in use`
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### `npm install` fails
- Make sure you are in the **project root** folder (where `package.json` is), not inside `apps/frontend` or `apps/backend`
- Try: `npm install --legacy-peer-deps`

### `prisma migrate dev` fails with "relation does not exist"
- The database might not exist yet. Create it first:
  ```bash
  psql -U postgres -c "CREATE DATABASE battery_passport;"
  ```

### `Module not found` errors after pulling new changes
```bash
npm install
npx prisma generate --schema=apps/backend/prisma/schema.prisma
```

---

## 📂 Project Structure (quick reference)

```
battery-passport/
├── apps/
│   ├── frontend/          # Next.js 14 app (port 3000)
│   └── backend/           # NestJS API + Prisma (port 3001)
│       └── prisma/
│           ├── schema.prisma   # Database schema
│           └── seed.ts         # Demo data
├── packages/              # Shared code/types
├── docker-compose.yml     # Docker setup
├── .env.example           # Environment variable template
└── package.json           # Root (Turborepo)
```

---

> 💬 **Still stuck?** Check [`ISSUES_LOG.md`](./ISSUES_LOG.md) for a full log of known issues and their fixes.
