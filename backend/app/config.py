from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from functools import lru_cache
import os

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

class Settings(BaseSettings):

    APP_NAME: str = "Ulm Drive-or-Bus"
    PARKING_API_URL: str = "https://parken-in-ulm.de/get_parking_data"
    FETCH_INTERVAL_SECONDS: int = 30
    
    # Safety mechanism to prevent accidental use of production credentials in development.
    # OVERRIDE_ME is a placeholder that must be replaced with actual credentials in the .env
    # file for the settings to validate successfully.
    SUPABASE_URL: str = Field(..., validation_alias="OVERRIDE_ME")
    SUPABASE_KEY: str = Field(..., validation_alias="OVERRIDE_ME")

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

class DevSettings(Settings):

    ENV_NAME: str = "dev"
    DEBUG: bool = True
    
    SUPABASE_URL: str = Field(..., validation_alias="SUPABASE_DEV_URL")
    SUPABASE_KEY: str = Field(..., validation_alias="SUPABASE_DEV_KEY")
    SUPABASE_ANON_KEY: str = Field(..., validation_alias="SUPABASE_DEV_ANON")

class ProdSettings(Settings):

    ENV_NAME: str = "prod"
    DEBUG: bool = False

    SUPABASE_URL: str = Field(..., validation_alias="SUPABASE_PROD_URL")
    SUPABASE_KEY: str = Field(..., validation_alias="SUPABASE_PROD_KEY")
    SUPABASE_ANON_KEY: str = Field(..., validation_alias="SUPABASE_PROD_ANON")

@lru_cache()
def get_settings():
    env = os.getenv("ENV_MODE", "dev").lower()
    if env == "prod":
        return ProdSettings()
    return DevSettings()

settings = get_settings()