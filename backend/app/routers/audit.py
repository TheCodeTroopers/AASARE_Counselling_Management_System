from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditLog, UserRole
from app.schemas import AuditLogResponse
from app.core.auth import get_current_user, require_roles

router = APIRouter(prefix="/audit", tags=["Security Audit Logs"])

def log_action(db: Session, user_id: str, action: str, ip_address: str = None):
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()

@router.get(
    "/logs", 
    response_model=List[AuditLogResponse], 
    dependencies=[Depends(require_roles([UserRole.ADMIN.value]))]
)
def view_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
