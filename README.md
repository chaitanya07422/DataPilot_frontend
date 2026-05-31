# DataPilot Frontend

Web application for **DataPilot AI** — upload files, inspect cleaned tabular data, and browse datasets.

## What's implemented

| Feature | Status | Where |
|---------|--------|--------|
| File upload (PDF, CSV, Excel, TXT, MD) | Live | `/upload` |
| Dataset picker + create dataset | Live | `/upload` |
| Upload status polling | Live | Upload page file list |
| Dataset viewer (CSV/Excel) | Live | `/datasets/[id]` |
| Cleaning summary stats | Live | Dataset viewer |
| Re-clean options (checkboxes) | Live | Dataset viewer |
| AG Grid cleaned data table | Live | Dataset viewer |
| Dashboard | Placeholder | `/dashboard` |
| AI Chat | Placeholder | `/ai-chat` |
| Reports | Placeholder | `/reports` |
| Authentication | Not started | Uses dev seed dataset only |

### Tabular cleaning UI

On **Datasets → Default Dataset** (or any dataset with CSV/Excel files), the viewer includes:

1. **File selector** — pick an uploaded tabular file; shows row count and processing status.
2. **Cleaning summary** — original vs cleaned row counts, duplicates/empty rows removed, cells trimmed.
3. **Re-clean options** — toggle and re-apply:
   - Trim whitespace in cells
   - Normalize column headers
   - Remove empty rows
   - Remove duplicate rows
4. **Apply cleaning** — queues a backend job; grid and report refresh automatically.
5. **Cleaned data grid** — paginated AG Grid of rows from the API.

After upload, use **View cleaned data →** on the upload success message, or open:

`http://localhost:3000/datasets/00000000-0000-4000-8000-000000000002`

(Seed dataset ID from backend `prisma/seed.ts`.)

---

## Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| ShadCN UI | Component primitives |
| TanStack React Query | Server state / polling |
| Axios | HTTP client |
| AG Grid | Dataset table viewer |

---

## Prerequisites

- Node.js 22+
- npm
- [DataPilot backend](../datapilot-backend) running with **API + worker** (see backend README)

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

Recommended for development (hot reload):

```bash
cd ../datapilot-backend
docker compose up postgres redis qdrant -d
npm run prisma:migrate
npm run prisma:seed
npm run dev          # terminal 1 — API
npm run dev:worker   # terminal 2 — job worker
```

Verify:

```bash
curl http://localhost:3001/api/health
```

### 4. Start the frontend

```bash
npm run dev
```

Open **http://localhost:3000**

> If port 3000 is taken (e.g. Docker frontend), Next.js uses the next free port (e.g. **3002**). Update backend `CORS_ORIGIN` to match.

---

## App routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Redirect | → `/dashboard` |
| `/dashboard` | Dashboard | Placeholder panels |
| `/upload` | Upload | Multipart upload + dataset picker + status |
| `/datasets/[id]` | Dataset viewer | Cleaning UI + AG Grid |
| `/datasets/[id]?file=<fileId>` | Dataset viewer | Deep-link to a specific file |
| `/ai-chat` | AI Chat | Placeholder |
| `/reports` | Reports | Placeholder |

Sidebar **Datasets** links to the seed dataset: `00000000-0000-4000-8000-000000000002`.

---

## API endpoints used by this app

Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:3001/api`)

### Health

| Method | Endpoint | Used for |
|--------|----------|----------|
| `GET` | `/health` | Liveness |
| `GET` | `/health/ready` | DB + Redis readiness |

### Datasets

| Method | Endpoint | Used for |
|--------|----------|----------|
| `GET` | `/datasets` | Dataset list (upload picker) |
| `POST` | `/datasets` | Create dataset |
| `GET` | `/datasets/:id` | Dataset + uploaded files |
| `GET` | `/datasets/:id/files/:fileId/headers` | Column headers for grid |
| `GET` | `/datasets/:id/files/:fileId/rows` | Paginated cleaned rows |
| `GET` | `/datasets/:id/files/:fileId/cleaning-report` | Cleaning stats |
| `POST` | `/datasets/:id/files/:fileId/clean` | Re-clean with options |

### Uploads

| Method | Endpoint | Used for |
|--------|----------|----------|
| `GET` | `/uploads?datasetId=` | Files in dataset (polled while processing) |
| `POST` | `/uploads` | Multipart upload (`datasetId` + `file`) |

React Query hooks live in `src/lib/api/queries.ts`. Types in `src/types/index.ts`.

---

## End-to-end flow (tabular)

1. Open **Upload**, select **Default Dataset** (or create one).
2. Upload any CSV or Excel file.
3. Wait for status **Indexed** (polls every 2s).
4. Click **View cleaned data →** or go to **Datasets** in the sidebar.
5. Review **Cleaning summary**, adjust **Re-clean options**, click **Apply cleaning**.
6. Inspect rows in the AG Grid below.

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Project structure

```
src/
├── app/(app)/
│   ├── upload/              # UploadForm
│   ├── datasets/[id]/       # DatasetViewer
│   ├── dashboard/           # placeholder
│   ├── ai-chat/             # placeholder
│   └── reports/             # placeholder
├── components/
│   ├── upload/upload-form.tsx
│   ├── datasets/
│   │   ├── dataset-viewer.tsx   # cleaning UI + file picker
│   │   └── dataset-grid.tsx     # AG Grid
│   └── layout/
├── lib/api/                 # Axios + React Query
└── types/
```

---

## Tooling URLs (with backend running)

| Tool | URL |
|------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Bull Board (jobs) | http://localhost:3001/admin/queues |
| Prisma Studio | http://localhost:5555 |
| Qdrant dashboard | http://localhost:6335/dashboard |

---

## Troubleshooting

### API connection errors

1. `curl http://localhost:3001/api/health`
2. Confirm `NEXT_PUBLIC_API_URL` matches your API port
3. Restart Next.js after changing `.env`

### Upload stays on Queued / Processing

The **worker** must be running: `npm run dev:worker` in the backend repo. Check jobs at http://localhost:3001/admin/queues.

### Port 3000 / 3001 conflicts

Stop Docker containers using those ports, or run local dev on alternate ports and update `CORS_ORIGIN` in backend `.env`.

### CORS errors

Set backend `CORS_ORIGIN` to your exact frontend origin (including port), e.g. `http://localhost:3002`.

---

## Pending (frontend)

- Wire **Dashboard** to real metrics (datasets, uploads, job stats)
- **AI Chat** UI connected to RAG / vector search
- **Reports** export and saved views
- **Auth** (login, user-scoped datasets)
- **Duplicate key columns** picker (API supports `duplicateKeyColumns`; UI not exposed yet)
- **Multi-sheet Excel** sheet selector (backend stores one sheet per file today)
- Poll dataset file status on dataset page after re-clean (upload page already polls)

---

## Related repo

Backend: [`datapilot-backend`](../datapilot-backend)
