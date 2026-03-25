from fastapi import APIRouter
from app.database import supabase
from app.utils.parking_models import ParkingLotStatus

router = APIRouter()

@router.get("/parking", response_model=list[ParkingLotStatus])
async def get_parking():
    result = supabase.rpc("get_latest_parking_status").execute()
    return [
        ParkingLotStatus(
            **row,
            occupancy_pct=row["current_occupancy"] / row["total_spaces"]
            if row.get("total_spaces") and row.get("current_occupancy") is not None
            else 0.0,
        )
        for row in result.data
    ]
