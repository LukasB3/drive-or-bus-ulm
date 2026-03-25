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

# Static coordinates for Ulm parking garages (not provided by the API)
PARKING_COORDINATES: dict[int, tuple[float, float]] = {
    1: (48.397127, 9.990928),   # Am Rathaus 
    2: (48.397126, 9.990926),   # Salzstadel
    3: (48.398077, 9.984820),   # Deutschhaus 
    4: (48.39658, 9.988236),    # Fischerviertel
    5: (48.401646, 10.00243),   # CCU Nord
    6: (48.400941, 10.00406),   # CCU Süd 
    7: (48.401180, 9.985870),   # Theater 
    8: (48.398318, 9.984285),   # Am Bahnhof 
    9: (48.401259, 9.995899),   # Frauenstraße  
    10: (48.400940, 9.994941),  # Kornhaus 
}

async def fetch_and_sync_parking():
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.post(
                settings.PARKING_API_URL,
                json={"jsonrpc": "2.0", "method": "call", "params": {}},
            )
            response.raise_for_status()

            validated = ParkingDataResponse(**response.json())

            lots_rows = []
            status_rows = []
            for facility in validated.result.facilities:
                lat, lon = PARKING_COORDINATES.get(facility.id, (None, None))
                lots_rows.append({
                    "id": facility.id,
                    "name": facility.name,
                    "total_spaces": facility.total_parking_spaces,
                    "lat": lat,
                    "lon": lon,
                })
                status_rows.append({
                    "lot_id": facility.id,
                    "current_occupancy": facility.current_occupancy,
                    "vacant_spaces": facility.vacant_parking_spaces,
                })

            supabase.table("parking_lots").upsert(lots_rows).execute()
            supabase.table("parking_status").insert(status_rows).execute()

            logger.info(f"Successfully synced {len(validated.result.facilities)} parking facilities.")

        except Exception as e:
            logger.error(f"Failed to sync parking data: {e}")

async def parking_loop():
    logger.info("Starting background parking sync loop...")
    while True:
        await fetch_and_sync_parking()
        await asyncio.sleep(settings.FETCH_INTERVAL_SECONDS)
