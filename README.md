# drive-or-bus-ulm

Real-time parking and transit tracker for Ulm. Shows live parking garage occupancy and bus / tram positions on an interactive map to help you decide: drive or take the bus?

**Live:** [drive-or-bus.lukasbossert.com](https://drive-or-bus.lukasbossert.com)

## Data Sources / Flow
- Parking: backend fetches [parken-in-ulm.de](https://parken-in-ulm.de) every 5 min → pushes to frontends via WebSocket (`/ws/parking`)
- Bus/tram: backend polls [SWU API](https://api.swu.de) every 15s → broadcasts to frontends via WebSocket (`/ws/bus`)
- Route shapes: backend downloads GTFS data from [gtfs.swu.de](https://gtfs.swu.de) weekly → keeps polylines in memory → sends them to frontends via WebSocket (`/ws/routes`)

## Features

- Live parking occupancy for 10 city-center garages
- Real-time bus and tram positions on a Leaflet map 
- Route polylines shown on marker hover
- Collapsible sidebar with parking and bus / tram information summaries

## Setup local

### Prerequisites

- [Node.js](https://nodejs.org/) (for frontend)
- [uv](https://docs.astral.sh/uv/) (for backend)
- No database and no credentials: the backend keeps the latest data in memory and refills it on start
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
- **Frontend:** Vercel (GitHub integration, root directory `frontend/`, push to `main` = production)
- **Database:** none; all state is in memory on the backend
