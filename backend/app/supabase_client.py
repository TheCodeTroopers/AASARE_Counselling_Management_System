import os
from supabase import create_client, Client
from app.config import settings

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vgsyirselvakpjcfwfgi.supabase.co")
SUPABASE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY", 
    os.getenv("SUPABASE_PUBLISHABLE_KEY", "sb_secret_OUSPxCp5cTjZOJTbH59kFw_ExGatiy-")
)

_supabase_client: Client = None

def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client
