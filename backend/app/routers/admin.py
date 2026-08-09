from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Counsellor, Appointment, UserRole, DailySlot
from app.schemas import (
    CounsellorCreate, 
    CounsellorResponse, 
    UserResponse, 
    AppointmentResponse
)
from app.core.auth import require_roles, get_password_hash

router = APIRouter(prefix="/admin", tags=["Administrator Panel"])

# Enforce Administrator role for all endpoints in this router
admin_guard = Depends(require_roles([UserRole.ADMIN.value]))

@router.post("/counsellors", response_model=CounsellorResponse, dependencies=[admin_guard])
def add_counsellor(payload: CounsellorCreate, db: Session = Depends(get_db)):
    """
    Administrator adds a new counsellor.
    Creates both the User credential account and the Counsellor profile.
    """
    if payload.email and payload.password:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User email already exists.")
        user = User(
            email=payload.email,
            hashed_password=get_password_hash(payload.password),
            full_name=payload.name,
            department=payload.department,
            role=UserRole.COUNSELLOR.value
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id
    elif payload.user_id:
        user_id = payload.user_id
    else:
        raise HTTPException(status_code=400, detail="Must provide email/password or existing user_id.")

    counsellor = Counsellor(
        user_id=user_id,
        name=payload.name,
        designation=payload.designation,
        department=payload.department,
        bio=payload.bio
    )
    db.add(counsellor)
    db.commit()
    db.refresh(counsellor)
    return counsellor

@router.delete("/counsellors/{counsellor_id}", dependencies=[admin_guard])
def deactivate_counsellor(counsellor_id: str, db: Session = Depends(get_db)):
    counsellor = db.query(Counsellor).filter(Counsellor.id == counsellor_id).first()
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")

    user = db.query(User).filter(User.id == counsellor.user_id).first()
    if user:
        user.is_active = False
    counsellor.is_available = False

    db.commit()
    return {"message": f"Counsellor {counsellor.name} deactivated successfully."}

@router.get("/counsellors", response_model=List[CounsellorResponse], dependencies=[admin_guard])
def list_all_counsellors(db: Session = Depends(get_db)):
    return db.query(Counsellor).all()

@router.get("/schedules", dependencies=[admin_guard])
def view_all_schedules(db: Session = Depends(get_db)):
    """
    View high-level appointment schedules across all counsellors.
    Note: Case sheets/notes are explicitly omitted for confidentiality.
    """
    appointments = db.query(Appointment).all()
    schedules = []
    for apt in appointments:
        student = db.query(User).filter(User.id == apt.student_id).first()
        counsellor = db.query(Counsellor).filter(Counsellor.id == apt.counsellor_id).first()
        schedules.append({
            "appointment_id": apt.id,
            "date": apt.date,
            "slot_time": apt.slot_time,
            "status": apt.status,
            "student_name": student.full_name if student else "Unknown",
            "counsellor_name": counsellor.name if counsellor else "Unknown"
        })
    return schedules

@router.get("/assigned-students", dependencies=[admin_guard])
def view_assigned_students(db: Session = Depends(get_db)):
    """
    View assigned students per counsellor.
    Omits all confidential case study notes & documents.
    """
    appointments = db.query(Appointment).all()
    assignments = {}
    for apt in appointments:
        counsellor = db.query(Counsellor).filter(Counsellor.id == apt.counsellor_id).first()
        student = db.query(User).filter(User.id == apt.student_id).first()
        if counsellor and student:
            c_name = counsellor.name
            if c_name not in assignments:
                assignments[c_name] = set()
            assignments[c_name].add(student.full_name)

    return {c_name: list(students) for c_name, students in assignments.items()}
