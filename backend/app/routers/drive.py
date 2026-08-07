import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import DriveConnection, CaseStudy, CaseDocument, Counsellor
from app.schemas import CaseDocumentResponse
from app.core.auth import get_current_counsellor

router = APIRouter(prefix="/drive", tags=["Google Drive Integration"])

@router.get("/auth-url")
def get_google_drive_auth_url(counsellor: Counsellor = Depends(get_current_counsellor)):
    """
    Generate Google Drive OAuth connection URL.
    """
    if not settings.GOOGLE_CLIENT_ID:
        # Development fallback / mock URL if client ID is not configured yet
        return {
            "auth_url": f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=MOCK_CLIENT_ID&redirect_uri={settings.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/drive.file&state={counsellor.id}"
        }
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
        f"scope=https://www.googleapis.com/auth/drive.file&"
        f"access_type=offline&prompt=consent&state={counsellor.id}"
    )
    return {"auth_url": auth_url}

@router.post("/callback")
def drive_oauth_callback(
    code: str,
    counsellor_id: str,
    db: Session = Depends(get_db)
):
    """
    Callback endpoint to store Google Drive OAuth token for counsellor.
    """
    conn = db.query(DriveConnection).filter(DriveConnection.counsellor_id == counsellor_id).first()
    mock_tokens = json.dumps({"access_token": "mock_access_token", "refresh_token": "mock_refresh_token", "code": code})

    if not conn:
        conn = DriveConnection(
            counsellor_id=counsellor_id,
            tokens_json=mock_tokens
        )
        db.add(conn)
    else:
        conn.tokens_json = mock_tokens

    db.commit()
    return {"message": "Google Drive successfully connected for counsellor."}

@router.post("/upload", response_model=CaseDocumentResponse)
async def upload_document_to_case_study(
    case_study_id: str = Form(...),
    file: UploadFile = File(...),
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db)
):
    # Verify case study belongs to counsellor
    case_study = db.query(CaseStudy).filter(
        CaseStudy.id == case_study_id,
        CaseStudy.counsellor_id == counsellor.id
    ).first()
    if not case_study:
        raise HTTPException(status_code=404, detail="Case study not found or access denied.")

    # Save document record (mock drive upload file id for quick execution)
    file_content = await file.read()
    document = CaseDocument(
        case_study_id=case_study.id,
        file_name=file.filename,
        file_url=f"/storage/case-docs/{file.filename}",
        drive_file_id=f"gdrive_{file.filename}_mock_id"
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document
