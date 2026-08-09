import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.orm import relationship
import enum

from app.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    COUNSELLOR = "counsellor"
    ADMIN = "admin"

class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class SlotStatus(str, enum.Enum):
    AVAILABLE = "available"
    PENDING = "pending"
    BOOKED = "booked"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    usn = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    year = Column(String(50), nullable=True)
    role = Column(String(20), default=UserRole.STUDENT.value, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    counsellor_profile = relationship("Counsellor", back_populates="user", uselist=False)
    appointments = relationship("Appointment", back_populates="student")

class Counsellor(Base):
    __tablename__ = "counsellors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True)
    max_slots_per_day = Column(Integer, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="counsellor_profile")
    daily_slots = relationship("DailySlot", back_populates="counsellor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="counsellor")
    case_studies = relationship("CaseStudy", back_populates="counsellor")

class DailySlot(Base):
    __tablename__ = "daily_slots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    counsellor_id = Column(String(36), ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(10), nullable=False) # YYYY-MM-DD
    slot_time = Column(String(50), nullable=False) # e.g. "10:00 AM - 11:00 AM"
    status = Column(String(20), default=SlotStatus.AVAILABLE.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    counsellor = relationship("Counsellor", back_populates="daily_slots")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    counsellor_id = Column(String(36), ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(10), nullable=False)
    slot_time = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default=AppointmentStatus.PENDING.value, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("User", back_populates="appointments")
    counsellor = relationship("Counsellor", back_populates="appointments")

class CaseStudy(Base):
    __tablename__ = "case_studies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    counsellor_id = Column(String(36), ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    general_info = Column(Text, nullable=True)
    reason_for_visit = Column(Text, nullable=True)
    background = Column(Text, nullable=True)
    first_aid_response = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    consent_confidentiality = Column(Boolean, default=True)
    is_draft = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    counsellor = relationship("Counsellor", back_populates="case_studies")
    followups = relationship("CaseFollowup", back_populates="case_study", cascade="all, delete-orphan")
    documents = relationship("CaseDocument", back_populates="case_study", cascade="all, delete-orphan")

class CaseFollowup(Base):
    __tablename__ = "case_followups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_study_id = Column(String(36), ForeignKey("case_studies.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(10), nullable=False)
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    case_study = relationship("CaseStudy", back_populates="followups")

class CaseDocument(Base):
    __tablename__ = "case_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_study_id = Column(String(36), ForeignKey("case_studies.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(Text, nullable=True)
    drive_file_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case_study = relationship("CaseStudy", back_populates="documents")

class DriveConnection(Base):
    __tablename__ = "drive_connections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    counsellor_id = Column(String(36), ForeignKey("counsellors.id", ondelete="CASCADE"), unique=True, nullable=False)
    tokens_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    action = Column(String(255), nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
