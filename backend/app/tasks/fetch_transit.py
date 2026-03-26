import asyncio

import httpx

from app.config import settings
from app.logger import logger
from app.utils.transit_models import BusPosition, SWUVehicleTripResponse
from app.ws_manager import BusWSManager


async def fetch_bus_positions() -> list[BusPosition]:
    async with httpx.AsyncClient() as client:
        response = await client.get(settings.SWU_API_URL)
        response.raise_for_status()

    parsed = SWUVehicleTripResponse(**response.json())
    positions: list[BusPosition] = []

    for entry in parsed.VehicleTrip.TripData:
        if not entry.IsActive or entry.PositionData is None or entry.JourneyData is None:
            continue
        if entry.JourneyData.RouteNumber is None:
            continue
        deviation = entry.TimeData.Deviation if entry.TimeData else 0
        positions.append(BusPosition(
            vehicleNumber=entry.VehicleNumber,
            lat=entry.PositionData.Latitude,
            lon=entry.PositionData.Longitude,
            bearing=entry.PositionData.Bearing,
            routeNumber=entry.JourneyData.RouteNumber,
            direction=entry.JourneyData.ArrivalDirectionText or "",
            deviation=deviation,
            category=entry.VehicleCategory,
        ))

    return positions


async def bus_broadcast_loop(manager: BusWSManager):
    logger.info("Starting bus broadcast loop...")
    while True:
        if not manager.connections:
            logger.info("No clients connected, waiting...")
            await manager._fetch_event.wait()
            manager._fetch_event.clear()
        try:
            positions = await fetch_bus_positions()
            data = f"[{','.join(p.model_dump_json() for p in positions)}]"
            manager.last_broadcast = data
            await manager.broadcast(data)
            logger.info(f"Broadcast {len(positions)} bus positions to {len(manager.connections)} clients")
        except Exception as e:
            logger.error(f"Failed to fetch bus positions: {e}")
        await asyncio.sleep(settings.BUS_FETCH_INTERVAL_SECONDS)
