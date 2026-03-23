from supabase import create_client, Client
from app.config import settings

supabase: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_KEY
)

def get_supabase() -> Client:
    """
    Returns the initialized Supabase client. 
    Useful if you want to use FastAPI Dependency Injection later.
    """
    return supabase