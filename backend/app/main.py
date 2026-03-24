import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.tasks.fetch_parking import parking_loop
from app.routes import health, parking
from app.logger import logger

"""
Entrypoint for the FastAPI application. 
"""

@asynccontextmanager
async def lifespan(app: FastAPI):
  
    logger.info("Starting Ulm Drive-or-Bus Backend...")

    # Create background tasks here so it doesn't "block" the API from starting
    parking_task = asyncio.create_task(parking_loop())

    # The FastAPI app runs here
    yield

    # SHUTDOWN: Gracefully stop the loop if the server stops
    parking_task.cancel()

    logger.info("🛑 Backend shutting down...")

app = FastAPI(
    title="Ulm Drive-or-Bus API",
    lifespan=lifespan
)

# Routes
app.include_router(health.router)
app.include_router(parking.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
