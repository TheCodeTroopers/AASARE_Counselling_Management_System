import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Counsellor, UserRole
from app.core.auth import get_password_hash

# Import routers
from app.routers import (
    auth,
    counsellors,
    appointments,
    case_studies,
    admin,
    drive,
    notifications,
    audit
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Enable CORS for frontend development
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(counsellors.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router, prefix=settings.API_V1_STR)
app.include_router(case_studies.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(drive.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_default_data():
    db = SessionLocal()
    try:
        # 1. Seed Admin user if not exists
        admin_user = db.query(User).filter(User.email == "admin@sode-edu.in").first()
        if not admin_user:
            admin_user = User(
                email="admin@sode-edu.in",
                hashed_password=get_password_hash("Admin@AASARE2026"),
                full_name="AASARE System Administrator",
                department="Management",
                role=UserRole.ADMIN.value
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("[Seed] Created default admin user: admin@sode-edu.in")

        # 2. Seed Default Counsellor if not exists
        counsellor_user = db.query(User).filter(User.email == "counsellor@sode-edu.in").first()
        if not counsellor_user:
            counsellor_user = User(
                email="counsellor@sode-edu.in",
                hashed_password=get_password_hash("Counsellor@AASARE2026"),
                full_name="Dr. Vidya Bhat",
                department="Basic Sciences & Humanities",
                role=UserRole.COUNSELLOR.value
            )
            db.add(counsellor_user)
            db.commit()
            db.refresh(counsellor_user)

            counsellor = Counsellor(
                user_id=counsellor_user.id,
                name="Dr. Vidya Bhat",
                designation="Student Welfare Officer & Head Counsellor",
                department="Basic Sciences & Humanities",
                bio="Dedicated student counsellor providing compassionate and confidential emotional, academic, and psychological support.",
                is_available=True,
                max_slots_per_day=2
            )
            db.add(counsellor)
            db.commit()
            print("[Seed] Created default counsellor: Dr. Vidya Bhat (counsellor@sode-edu.in)")

    finally:
        db.close()

from app.supabase_client import get_supabase

@app.get("/api/supabase/status")
def supabase_status():
    try:
        supabase = get_supabase()
        return {
            "status": "connected",
            "supabase_url": settings.SUPABASE_URL,
            "project_id": "vgsyirselvakpjcfwfgi"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "docs": f"{settings.API_V1_STR}/docs"
    }
