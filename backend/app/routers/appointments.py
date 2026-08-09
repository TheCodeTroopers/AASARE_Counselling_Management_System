from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Appointment, AppointmentStatus, Counsellor, DailySlot, SlotStatus, User, UserRole, Notification
from app.schemas import AppointmentCreate, AppointmentResponse, AppointmentStatusUpdate
from app.core.auth import get_current_user, get_current_counsellor, require_roles

router = APIRouter(prefix="/appointments", tags=["Appointments Management"])

def _format_appointment_res(apt: Appointment, db: Session) -> AppointmentResponse:
    student = db.query(User).filter(User.id == apt.student_id).first()
    counsellor = db.query(Counsellor).filter(Counsellor.id == apt.counsellor_id).first()
    res = AppointmentResponse.from_orm(apt)
    res.student_name = student.full_name if student else "Student"
    res.counsellor_name = counsellor.name if counsellor else "Counsellor"
    return res

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify counsellor exists and is available
    counsellor = db.query(Counsellor).filter(Counsellor.id == payload.counsellor_id).first()
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    if not counsellor.is_available:
        raise HTTPException(status_code=400, detail="This counsellor is currently unavailable.")

    # Check for double booking
    existing = db.query(Appointment).filter(
        Appointment.counsellor_id == payload.counsellor_id,
        Appointment.date == payload.date,
        Appointment.slot_time == payload.slot_time,
        Appointment.status.in_([AppointmentStatus.PENDING.value, AppointmentStatus.APPROVED.value])
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This slot is already reserved or awaiting approval. Please select a different time slot."
        )

    appointment = Appointment(
        student_id=current_user.id,
        counsellor_id=payload.counsellor_id,
        date=payload.date,
        slot_time=payload.slot_time,
        reason=payload.reason,
        status=AppointmentStatus.PENDING.value
    )
    db.add(appointment)

    # Mark slot state if tracked in daily_slots
    slot = db.query(DailySlot).filter(
        DailySlot.counsellor_id == payload.counsellor_id,
        DailySlot.date == payload.date,
        DailySlot.slot_time == payload.slot_time
    ).first()
    if slot:
        slot.status = SlotStatus.PENDING.value

    # Notify Counsellor
    counsellor_user = db.query(User).filter(User.id == counsellor.user_id).first()
    if counsellor_user:
        notification = Notification(
            user_id=counsellor_user.id,
            title="New Appointment Request",
            message=f"Student {current_user.full_name} requested a slot on {payload.date} at {payload.slot_time}."
        )
        db.add(notification)

    db.commit()
    db.refresh(appointment)
    return _format_appointment_res(appointment, db)

@router.get("/my", response_model=List[AppointmentResponse])
def get_student_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointments = db.query(Appointment).filter(
        Appointment.student_id == current_user.id
    ).order_by(Appointment.created_at.desc()).all()
    return [_format_appointment_res(a, db) for a in appointments]

@router.get("/counsellor", response_model=List[AppointmentResponse])
def get_counsellor_appointments(
    status_filter: Optional[str] = None,
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment).filter(Appointment.counsellor_id == counsellor.id)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    appointments = query.order_by(Appointment.created_at.desc()).all()
    return [_format_appointment_res(a, db) for a in appointments]

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.counsellor_id == counsellor.id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if payload.status == AppointmentStatus.REJECTED.value and not payload.rejection_reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required when rejecting an appointment.")

    appointment.status = payload.status
    if payload.rejection_reason:
        appointment.rejection_reason = payload.rejection_reason

    # Update slot state
    slot = db.query(DailySlot).filter(
        DailySlot.counsellor_id == counsellor.id,
        DailySlot.date == appointment.date,
        DailySlot.slot_time == appointment.slot_time
    ).first()

    if slot:
        if payload.status == AppointmentStatus.APPROVED.value:
            slot.status = SlotStatus.BOOKED.value
        elif payload.status in [AppointmentStatus.REJECTED.value, AppointmentStatus.CANCELLED.value]:
            slot.status = SlotStatus.AVAILABLE.value

    # Notify student
    notification = Notification(
        user_id=appointment.student_id,
        title=f"Appointment {payload.status.capitalize()}",
        message=f"Your appointment with {counsellor.name} on {appointment.date} at {appointment.slot_time} has been {payload.status}." + 
                (f" Reason: {payload.rejection_reason}" if payload.rejection_reason else "")
    )
    db.add(notification)

    db.commit()
    db.refresh(appointment)
    return _format_appointment_res(appointment, db)

@router.put("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.student_id == current_user.id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = AppointmentStatus.CANCELLED.value

    # Free up slot
    slot = db.query(DailySlot).filter(
        DailySlot.counsellor_id == appointment.counsellor_id,
        DailySlot.date == appointment.date,
        DailySlot.slot_time == appointment.slot_time
    ).first()
    if slot:
        slot.status = SlotStatus.AVAILABLE.value

    db.commit()
    db.refresh(appointment)
    return _format_appointment_res(appointment, db)
