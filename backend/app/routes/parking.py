from fastapi import APIRouter
from app.tasks.fetch_parking import latest_lots
from app.utils.parking_models import ParkingLotStatus

router = APIRouter()

@router.get("/parking", response_model=list[ParkingLotStatus])
async def get_parking():
    return [
        ParkingLotStatus(
            **row,
            occupancy_pct=row["current_occupancy"] / row["total_spaces"] if row["total_spaces"] else 0.0,
        )
        for row in latest_lots
    ]
