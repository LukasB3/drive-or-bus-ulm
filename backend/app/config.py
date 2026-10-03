from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from functools import lru_cache

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

class Settings(BaseSettings):

    APP_NAME: str = "Ulm Drive-or-Bus"

    # fetches live parking data
    PARKING_API_URL: str = "https://parken-in-ulm.de/get_parking_data"
    FETCH_INTERVAL_SECONDS: int = 300

    # fetches live bus data
    SWU_API_URL: str = "https://api.swu.de/mobility/v1/vehicle/trip/Trip"
    BUS_FETCH_INTERVAL_SECONDS: int = 15

    # updates the routes of the busses
    GTFS_URL: str = "https://gtfs.swu.de/daten/SWU.zip"
    GTFS_FETCH_INTERVAL_SECONDS: int = 604800  # 1 week
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://drive-or-bus.lukasbossert.com",
        "https://drive-or-bus-ulm.vercel.app",
    ]

    SUPABASE_URL: str
    SUPABASE_KEY: str

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()