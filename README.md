# drive-or-bus-ulm

Real-time parking and transit tracker for Ulm. Shows live parking garage occupancy and bus / tram positions on an interactive map to help you decide: drive or take the bus?

**Live:** [drive-or-bus-ulm.pages.dev](https://drive-or-bus-ulm.pages.dev)

## Data Sources / Flow
- Parking: backend fetches [parken-in-ulm.de](https://parken-in-ulm.de) → writes to Supabase → frontend subscribes via Realtime
- Bus/tram: backend polls [SWU API](https://api.swu.de) every 15s → broadcasts to frontends via WebSocket 
- Route shapes: backend downloads GTFS data from [gtfs.swu.de](https://gtfs.swu.de) weekly → stores polylines in Supabase → frontend fetches on load

## Features

- Live parking occupancy for 10 city-center garages
- Real-time bus and tram positions on a Leaflet map 
- Route polylines shown on marker hover
- Collapsible sidebar with parking and bus / tram information summaries

## Setup local

### Prerequisites

- [Node.js](https://nodejs.org/) (for frontend)
- [uv](https://docs.astral.sh/uv/) (for backend)
- [Supabase](https://supabase.com/) project with schema from `db/init_supabase.sql`
- Requires a root `.env` with Supabase credentials:
```
SUPABASE_DEV_URL=<your-supabase-url>
SUPABASE_DEV_KEY=<your-anon-key>
SUPABASE_DEV_ANON=<your-anon-key>
```
- Requires `frontend/.env` with:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
## Run local

### Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment 

- **Backend:** Docker on Hetzner VPS, behind Caddy reverse proxy with auto-HTTPS
- **Frontend:** Cloudflare Pages (static build from `frontend/dist/`)
- **Database:** Supabase (eu-central-1)
