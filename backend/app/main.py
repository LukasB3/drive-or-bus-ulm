import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.tasks.fetch_parking import parking_loop
from app.routes import health, parking

@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: This runs when the Hetzner server starts the container
    print("🚀 Starting Ulm Drive-or-Bus Backend...")

    # We create a background task so it doesn't "block" the API from starting
    parking_task = asyncio.create_task(parking_loop())

    yield  # The FastAPI app runs here

    # SHUTDOWN: Gracefully stop the loop if the server stops
    parking_task.cancel()
    print("🛑 Backend shutting down...")

app = FastAPI(
    title="Ulm Drive-or-Bus API",
    lifespan=lifespan
)

# Include our routes
app.include_router(health.router)
app.include_router(parking.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
