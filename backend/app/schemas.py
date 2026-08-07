from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- Auth & User Schemas ---

class UserSignUp(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    usn: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    role: Optional[str] = "student"

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    usn: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Counsellor & Slot Schemas ---

class CounsellorCreate(BaseModel):
    user_id: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    name: str
    designation: str
    department: str
    bio: Optional[str] = None

class CounsellorResponse(BaseModel):
    id: str
    user_id: str
    name: str
    designation: str
    department: str
    bio: Optional[str] = None
    is_available: bool
    max_slots_per_day: int

    class Config:
        from_attributes = True

class DailySlotCreate(BaseModel):
    date: str
    slot_time: str

class DailySlotResponse(BaseModel):
    id: str
    counsellor_id: str
    date: str
    slot_time: str
    status: str

    class Config:
        from_attributes = True

class ToggleAvailabilityInput(BaseModel):
    is_available: bool

# --- Appointment Schemas ---

class AppointmentCreate(BaseModel):
    counsellor_id: str
    date: str
    slot_time: str
    reason: str

class AppointmentStatusUpdate(BaseModel):
    status: str # approved, rejected, completed
    rejection_reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    student_id: str
    counsellor_id: str
    date: str
    slot_time: str
    reason: str
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    student_name: Optional[str] = None
    counsellor_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Case Study Schemas ---

class CaseFollowupCreate(BaseModel):
    date: str
    notes: str

class CaseFollowupResponse(BaseModel):
    id: str
    date: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True

class CaseDocumentResponse(BaseModel):
    id: str
    file_name: str
    file_url: Optional[str] = None
    drive_file_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CaseStudyCreate(BaseModel):
    student_id: str
    general_info: Optional[str] = None
    reason_for_visit: Optional[str] = None
    background: Optional[str] = None
    first_aid_response: Optional[str] = None
    observations: Optional[str] = None
    consent_confidentiality: bool = True
    is_draft: bool = True

class CaseStudyUpdate(BaseModel):
    general_info: Optional[str] = None
    reason_for_visit: Optional[str] = None
    background: Optional[str] = None
    first_aid_response: Optional[str] = None
    observations: Optional[str] = None
    consent_confidentiality: Optional[bool] = None
    is_draft: Optional[bool] = None

class CaseStudyResponse(BaseModel):
    id: str
    counsellor_id: str
    student_id: str
    general_info: Optional[str] = None
    reason_for_visit: Optional[str] = None
    background: Optional[str] = None
    first_aid_response: Optional[str] = None
    observations: Optional[str] = None
    consent_confidentiality: bool
    is_draft: bool
    created_at: datetime
    updated_at: datetime
    followups: List[CaseFollowupResponse] = []
    documents: List[CaseDocumentResponse] = []

    class Config:
        from_attributes = True

# --- Notifications & Audit Schemas ---

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
