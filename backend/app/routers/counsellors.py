from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Counsellor, DailySlot, Appointment, AppointmentStatus, SlotStatus, User
from app.schemas import (
    CounsellorResponse, 
    DailySlotResponse, 
    DailySlotCreate, 
    ToggleAvailabilityInput
)
from app.core.auth import get_current_user, get_current_counsellor, require_roles

router = APIRouter(prefix="/counsellors", tags=["Counsellor & Availability Management"])

@router.get("", response_model=List[CounsellorResponse])
def list_counsellors(department: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Counsellor)
    if department:
        query = query.filter(Counsellor.department == department)
    return query.all()

@router.get("/{counsellor_id}", response_model=CounsellorResponse)
def get_counsellor(counsellor_id: str, db: Session = Depends(get_db)):
    counsellor = db.query(Counsellor).filter(Counsellor.id == counsellor_id).first()
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    return counsellor

@router.put("/availability", response_model=CounsellorResponse)
def toggle_availability(
    payload: ToggleAvailabilityInput,
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    counsellor.is_available = payload.is_available
    db.commit()
    db.refresh(counsellor)
    return counsellor

@router.get("/{counsellor_id}/slots", response_model=List[DailySlotResponse])
def get_counsellor_slots(counsellor_id: str, date: str, db: Session = Depends(get_db)):
    slots = db.query(DailySlot).filter(
        DailySlot.counsellor_id == counsellor_id,
        DailySlot.date == date
    ).all()
    return slots

@router.post("/daily-slots", response_model=List[DailySlotResponse])
def setup_daily_slots(
    slots_in: List[DailySlotCreate],
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    """
    Phase 4: Two-slot-per-day system / daily slot editor.
    Allows counsellor to set or update daily available slots.
    """
    if len(slots_in) > counsellor.max_slots_per_day:
        raise HTTPException(
            status_code=400,
            detail=f"Counsellor is limited to maximum {counsellor.max_slots_per_day} slots per day."
        )

    created_slots = []
    for slot_data in slots_in:
        # Check if slot already exists
        existing = db.query(DailySlot).filter(
            DailySlot.counsellor_id == counsellor.id,
            DailySlot.date == slot_data.date,
            DailySlot.slot_time == slot_data.slot_time
        ).first()

        if not existing:
            slot = DailySlot(
                counsellor_id=counsellor.id,
                date=slot_data.date,
                slot_time=slot_data.slot_time,
                status=SlotStatus.AVAILABLE.value
            )
            db.add(slot)
            created_slots.append(slot)
        else:
            created_slots.append(existing)

    db.commit()
    for s in created_slots:
        db.refresh(s)
    return created_slots

@router.get("/dashboard/stats")
def get_counsellor_dashboard_stats(
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    """
    Phase 3: Counsellor Dashboard Statistics
    """
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    today_appointments = db.query(Appointment).filter(
        Appointment.counsellor_id == counsellor.id,
        Appointment.date == today_str
    ).count()

    pending_requests = db.query(Appointment).filter(
        Appointment.counsellor_id == counsellor.id,
        Appointment.status == AppointmentStatus.PENDING.value
    ).count()

    approved_appointments = db.query(Appointment).filter(
        Appointment.counsellor_id == counsellor.id,
        Appointment.status == AppointmentStatus.APPROVED.value
    ).count()

    rejected_appointments = db.query(Appointment).filter(
        Appointment.counsellor_id == counsellor.id,
        Appointment.status == AppointmentStatus.REJECTED.value
    ).count()

    return {
        "today_appointments": today_appointments,
        "pending_requests": pending_requests,
        "approved_appointments": approved_appointments,
        "rejected_appointments": rejected_appointments,
        "availability_status": counsellor.is_available
    }
