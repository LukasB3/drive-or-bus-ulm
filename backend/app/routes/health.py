from fastapi import APIRouter

from app.tasks.fetch_parking import latest_lots
from app.tasks.fetch_gtfs import latest_shapes
from app.ws_manager import bus_channel, parking_channel, routes_channel

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "parking_lots": len(latest_lots),
        "route_shapes": len(latest_shapes),
        "clients": {
            "bus": len(bus_channel.connections),
            "parking": len(parking_channel.connections),
            "routes": len(routes_channel.connections),
        },
    }
