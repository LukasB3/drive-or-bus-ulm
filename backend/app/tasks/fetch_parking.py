import asyncio
import httpx
from app.config import settings
from app.database import supabase
from app.utils.parking_models import ParkingDataResponse

async def fetch_and_sync_parking():
    """Fetches real-time parking data from parken-in-ulm.de and syncs to Supabase."""
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

            print(f"✅ Synced {len(validated.result.facilities)} parking facilities.")

        except Exception as e:
            print(f"❌ Error in parking sync: {e}")

async def parking_loop():
    """Infinite loop to keep the data fresh."""
    while True:
        await fetch_and_sync_parking()
        await asyncio.sleep(settings.FETCH_INTERVAL_SECONDS)
