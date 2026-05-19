# DataPilot Frontend

Web application for **DataPilot AI** — an AI-native data intelligence platform.

> **Note:** Pages are placeholder UIs only. No business logic or live API integration yet.

## Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| ShadCN UI | Component primitives |
| Zustand | Client state |
| TanStack React Query | Server state / data fetching |
| Axios | HTTP client |
| AG Grid | Dataset table viewer |

---

## Prerequisites

- Node.js 22+
- npm
- [DataPilot backend](../datapilot-backend) running (for API calls)

---

## Setup

### 1. Install dependencies

```bash
cd datapilot-frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api` |

### 3. Start the backend

From the backend repo:

```bash
cd ../datapilot-backend
docker compose up -d
# or: npm run dev (+ npm run dev:worker)
```

Verify the API:

```bash
curl http://localhost:3001/api/health
```

### 4. Start the frontend

```bash
npm run dev
```

Open **http://localhost:3000**

> If port 3000 is taken (e.g. by Docker frontend), Next.js will use the next free port (e.g. **3002**) and print it in the terminal.

---

## App routes (pages)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Redirect | → `/dashboard` |
| `/dashboard` | Dashboard | Overview placeholders |
| `/upload` | Upload | File upload UI (placeholder) |
| `/datasets/[id]` | Dataset viewer | AG Grid sample table |
| `/ai-chat` | AI Chat | Conversational UI (placeholder) |
| `/reports` | Reports | Reports & exports (placeholder) |

Example dataset viewer: http://localhost:3000/datasets/sample

---

## Backend API endpoints (consumed by this app)

The frontend calls the API via `NEXT_PUBLIC_API_URL` (Axios client in `src/lib/api/client.ts`).

Base URL: `http://localhost:3001/api`

### Health

| Method | Endpoint | Used for |
|--------|----------|----------|
| `GET` | `/health` | API liveness (`useHealthCheck` hook — disabled by default) |
| `GET` | `/health/ready` | DB + Redis readiness |

### Users

| Method | Endpoint |
|--------|----------|
| `GET` | `/users` |
| `GET` | `/users/:id` |

### Datasets

| Method | Endpoint |
|--------|----------|
| `GET` | `/datasets` |
| `GET` | `/datasets/:id` |

### Uploads

| Method | Endpoint |
|--------|----------|
| `GET` | `/uploads` |
| `POST` | `/uploads` |

### AI

| Method | Endpoint |
|--------|----------|
| `GET` | `/ai/conversations` |
| `POST` | `/ai/conversations` |
| `POST` | `/ai/query` |

### Reports

| Method | Endpoint |
|--------|----------|
| `GET` | `/reports` |
| `GET` | `/reports/:id` |

All endpoints currently return **placeholder JSON** from the backend. Wire React Query hooks in `src/lib/api/` as features are implemented.

**Quick test from terminal:**

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/datasets
```

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run format:check` | Check formatting |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout + providers
│   ├── page.tsx             # Redirect to dashboard
│   └── (app)/               # Authenticated shell
│       ├── layout.tsx       # Sidebar layout
│       ├── dashboard/
│       ├── upload/
│       ├── datasets/[id]/
│       ├── ai-chat/
│       └── reports/
├── components/
│   ├── ui/                  # Button, Card, …
│   ├── layout/              # Sidebar, header, page shell
│   ├── datasets/            # AG Grid
│   └── shared/
├── lib/
│   ├── api/                 # Axios + React Query hooks
│   ├── providers/           # QueryClient provider
│   └── utils.ts             # cn() helper
├── stores/                  # Zustand (app-store)
└── types/
```

---

## Docker (optional)

The backend `docker-compose.yml` can build and run this frontend on port **3000**:

```bash
cd ../datapilot-backend
docker compose up frontend -d
```

For daily development, prefer **`npm run dev`** in this repo for hot reload.

---

## Tooling URLs (backend infrastructure)

When the backend stack is running:

| Tool | URL |
|------|-----|
| API | http://localhost:3001/api |
| App | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 (`npm run prisma:studio` in backend) |
| Qdrant dashboard | http://localhost:6335/dashboard |
| PostgreSQL | `localhost:5432` (user: `datapilot`, password: `datapilot`) |

---

## Troubleshooting

### API connection errors

1. Confirm backend is up: `curl http://localhost:3001/api/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env` matches how you run the API
3. Restart dev server after changing env vars

### Port 3000 in use

Docker frontend may occupy 3000. Either:

- Use the URL Next.js prints (e.g. http://localhost:3002), or
- Stop the container: `docker stop datapilot-frontend`

### CORS errors

Ensure backend `CORS_ORIGIN` includes your frontend origin (default `http://localhost:3000`). If using port 3002, update backend `.env`:

```env
CORS_ORIGIN=http://localhost:3002
```

---

## Related repo

Backend (separate git repo): [`datapilot-backend`](../datapilot-backend) — sibling folder, push independently to GitHub.
