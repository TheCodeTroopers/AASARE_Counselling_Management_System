from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CaseStudy, CaseFollowup, CaseDocument, Counsellor, User, UserRole
from app.schemas import (
    CaseStudyCreate, 
    CaseStudyUpdate, 
    CaseStudyResponse, 
    CaseFollowupCreate, 
    CaseFollowupResponse
)
from app.core.auth import get_current_user, get_current_counsellor, require_roles

router = APIRouter(prefix="/case-studies", tags=["Private Case Study Module"])

@router.post("", response_model=CaseStudyResponse, status_code=status.HTTP_201_CREATED)
def create_case_study(
    payload: CaseStudyCreate,
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    # Verify student exists
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    case_study = CaseStudy(
        counsellor_id=counsellor.id,
        student_id=payload.student_id,
        general_info=payload.general_info,
        reason_for_visit=payload.reason_for_visit,
        background=payload.background,
        first_aid_response=payload.first_aid_response,
        observations=payload.observations,
        consent_confidentiality=payload.consent_confidentiality,
        is_draft=payload.is_draft
    )
    db.add(case_study)
    db.commit()
    db.refresh(case_study)
    return case_study

@router.get("", response_model=List[CaseStudyResponse])
def list_own_case_studies(
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    """
    STRICT PRIVACY GUARD:
    Counsellors can only view case studies created by themselves.
    Administrators and students are strictly blocked at the auth dependency layer.
    """
    case_studies = db.query(CaseStudy).filter(
        CaseStudy.counsellor_id == counsellor.id
    ).order_by(CaseStudy.updated_at.desc()).all()
    return case_studies

@router.get("/{case_id}", response_model=CaseStudyResponse)
def get_case_study(
    case_id: str,
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    case_study = db.query(CaseStudy).filter(
        CaseStudy.id == case_id,
        CaseStudy.counsellor_id == counsellor.id
    ).first()
    if not case_study:
        raise HTTPException(
            status_code=404, 
            detail="Case study sheet not found or access denied."
        )
    return case_study

@router.put("/{case_id}", response_model=CaseStudyResponse)
def update_case_study(
    case_id: str,
    payload: CaseStudyUpdate,
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    case_study = db.query(CaseStudy).filter(
        CaseStudy.id == case_id,
        CaseStudy.counsellor_id == counsellor.id
    ).first()
    if not case_study:
        raise HTTPException(
            status_code=404, 
            detail="Case study sheet not found or access denied."
        )

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(case_study, field, val)

    db.commit()
    db.refresh(case_study)
    return case_study

@router.post("/{case_id}/followups", response_model=CaseFollowupResponse)
def add_case_followup(
    case_id: str,
    payload: CaseFollowupCreate,
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    case_study = db.query(CaseStudy).filter(
        CaseStudy.id == case_id,
        CaseStudy.counsellor_id == counsellor.id
    ).first()
    if not case_study:
        raise HTTPException(
            status_code=404, 
            detail="Case study sheet not found or access denied."
        )

    followup = CaseFollowup(
        case_study_id=case_study.id,
        date=payload.date,
        notes=payload.notes
    )
    db.add(followup)
    db.commit()
    db.refresh(followup)
    return followup
