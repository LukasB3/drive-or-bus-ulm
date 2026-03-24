import asyncio
import httpx
from app.config import settings
from app.database import supabase
from app.utils.parking_models import ParkingDataResponse
from app.logger import logger

"""
Fetches parking data in a fixed interval (defined in Config FETCH_INTERVAL_SECONDS)
from https://parken-in-ulm.de/get_parking_data and syncs it to Supabase database.
"""

async def fetch_and_sync_parking():
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.post(
                settings.PARKING_API_URL,
                json={"jsonrpc": "2.0", "method": "call", "params": {}},
            )
            response.raise_for_status()

            validated = ParkingDataResponse(**response.json())

            for facility in validated.result.facilities:
                supabase.table("parking_lots").upsert({
                    "id": facility.id,
                    "name": facility.name,
                    "total_spaces": facility.total_parking_spaces,
                }).execute()

                supabase.table("parking_status").insert({
                    "lot_id": facility.id,
                    "current_occupancy": facility.current_occupancy,
                    "vacant_spaces": facility.vacant_parking_spaces,
                }).execute()

            logger.info(f"Successfully synced {len(validated.result.facilities)} parking facilities.") 
            
        except Exception as e:
            logger.error(f"Failed to sync parking data: {e}")

async def parking_loop():
    logger.info("Starting background parking sync loop...")
    while True:
        await fetch_and_sync_parking()
        await asyncio.sleep(settings.FETCH_INTERVAL_SECONDS)
