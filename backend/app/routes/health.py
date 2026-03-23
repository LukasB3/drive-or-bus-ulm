from fastapi import APIRouter
from app.database import supabase

router = APIRouter()  # <--- This is what main.py is looking for!

@router.get("/health")
async def health_check():
    try:
        # Simple query to see if Supabase is alive
        supabase.table("parking_lots").select("id", count="exact").limit(1).execute()
        return {"status": "online", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}