from fastapi import APIRouter

router = APIRouter()

@router.get("/parking")
async def get_parking():
    # your logic here
    return {"message": "parking data"}