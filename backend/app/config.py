import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AASARE Counselling Management System API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret Key for JWT Signing
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "aasare_confidential_jwt_secret_key_2026_smvitm_safe")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://vgsyirselvakpjcfwfgi.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_PUBLISHABLE_KEY", "sb_secret_OUSPxCp5cTjZOJTbH59kFw_ExGatiy-"))

    # Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./aasare.db"
    )

    # Google OAuth configuration for Drive integration
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/drive/callback")

    class Config:
        case_sensitive = True

settings = Settings()
