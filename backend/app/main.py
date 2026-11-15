import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.tasks.fetch_parking import parking_loop
from app.tasks.fetch_transit import bus_broadcast_loop
from app.tasks.fetch_gtfs import gtfs_loop
from app.routes import health, parking, transit
from app.ws_manager import bus_channel
from app.config import settings
from app.logger import logger

"""
Entrypoint for the FastAPI application.
"""

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("Starting Ulm Drive-or-Bus Backend...")

    # Create background tasks here so it doesn't "block" the API from starting
    parking_task = asyncio.create_task(parking_loop())
    bus_task = asyncio.create_task(bus_broadcast_loop(bus_channel))
    gtfs_task = asyncio.create_task(gtfs_loop())

    # The FastAPI app runs here
    yield

    # SHUTDOWN: Gracefully stop the loop if the server stops
    parking_task.cancel()
    bus_task.cancel()
    gtfs_task.cancel()

    logger.info("🛑 Backend shutting down...")

app = FastAPI(
    title="Ulm Drive-or-Bus API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router)
app.include_router(parking.router, prefix="/api")
app.include_router(transit.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
