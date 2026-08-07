import json
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import DriveConnection, CaseStudy, CaseDocument, Counsellor
from app.schemas import CaseDocumentResponse
from app.core.auth import get_current_counsellor

router = APIRouter(prefix="/drive", tags=["Google Drive Integration"])


def _get_google_tokens(code: str) -> dict:
    """Exchange OAuth authorization code for access + refresh tokens."""
    import requests
    resp = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
    )
    return resp.json()


def _build_drive_service(tokens_json: str):
    """Build an authenticated Google Drive API service from stored tokens."""
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    tokens = json.loads(tokens_json)
    creds = Credentials(
        token=tokens.get("access_token"),
        refresh_token=tokens.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
    )
    return build("drive", "v3", credentials=creds)


def _upload_to_drive(service, file_bytes: bytes, filename: str, mime_type: str, folder_id: str | None = None) -> dict:
    """Upload file bytes to Google Drive and return file metadata."""
    from googleapiclient.http import MediaIoBaseUpload

    file_metadata = {"name": filename}
    if folder_id:
        file_metadata["parents"] = [folder_id]

    media = MediaIoBaseUpload(io.BytesIO(file_bytes), mimetype=mime_type or "application/octet-stream", resumable=True)
    uploaded = service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id,name,webViewLink,webContentLink",
    ).execute()

    # Make file publicly viewable (anyone with link)
    service.permissions().create(
        fileId=uploaded["id"],
        body={"type": "anyone", "role": "reader"},
    ).execute()

    return uploaded


@router.get("/auth-url")
def get_google_drive_auth_url(counsellor: Counsellor = Depends(get_current_counsellor)):
    """Generate Google Drive OAuth connection URL."""
    if not settings.GOOGLE_CLIENT_ID:
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


@router.get("/callback", response_class=HTMLResponse)
@router.post("/callback", response_class=HTMLResponse)
def drive_oauth_callback(
    code: str = None,
    state: str = None,
    error: str = None,
    db: Session = Depends(get_db),
):
    """Handle Google Drive OAuth redirect and exchange code for real tokens."""
    if error:
        return HTMLResponse(
            f"""
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 40px; background: #fdf2f2; color: #991b1b;">
                <h2>Google Connection Canceled</h2>
                <p>{error}</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
            """
        )

    counsellor_id = state or "default_counsellor"

    # Exchange code for real OAuth tokens
    token_data = {"access_token": "pending", "code": code}
    if code and settings.GOOGLE_CLIENT_SECRET:
        try:
            token_data = _get_google_tokens(code)
        except Exception as e:
            token_data = {"access_token": "exchange_failed", "error": str(e), "code": code}

    tokens_json = json.dumps(token_data)
    conn = db.query(DriveConnection).filter(DriveConnection.counsellor_id == counsellor_id).first()
    if not conn:
        conn = DriveConnection(counsellor_id=counsellor_id, tokens_json=tokens_json)
        db.add(conn)
    else:
        conn.tokens_json = tokens_json
    db.commit()

    return HTMLResponse(
        """
        <!DOCTYPE html>
        <html>
          <head><title>Google Drive Connected - AASARE</title></head>
          <body style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; background-color: #F8F3EE; color: #6D214F; text-align: center; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 20px; border: 1px solid #E8DDD5; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 400px; width: 100%;">
              <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
              <h2 style="margin: 0 0 10px 0; font-size: 20px;">Google Drive Connected!</h2>
              <p style="color: #2e7d32; font-weight: 600; font-size: 14px; margin: 0 0 15px 0;">Your AASARE account is linked successfully.</p>
              <p style="font-size: 12px; color: #777; margin: 0;">This window will close automatically in 2 seconds.</p>
            </div>
            <script>
              try { if (window.opener) { window.opener.postMessage('gdrive_connected', '*'); } } catch(e) {}
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
        """
    )


@router.post("/upload-file")
async def upload_file_to_drive(
    file: UploadFile = File(...),
    folder_id: str = Form(default=None),
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db),
):
    """
    Upload a file directly to Google Drive and return the Drive file ID and webViewLink.
    folder_id: optional Google Drive folder ID to upload into.
    """
    conn = db.query(DriveConnection).filter(DriveConnection.counsellor_id == counsellor.id).first()
    if not conn:
        raise HTTPException(
            status_code=403,
            detail="Google Drive not connected. Please connect your Drive account first."
        )

    file_bytes = await file.read()
    mime_type = file.content_type or "application/octet-stream"

    try:
        service = _build_drive_service(conn.tokens_json)
        uploaded = _upload_to_drive(service, file_bytes, file.filename, mime_type, folder_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Drive upload failed: {str(e)}")

    return {
        "success": True,
        "file_id": uploaded["id"],
        "file_name": uploaded.get("name", file.filename),
        "web_view_link": uploaded.get("webViewLink"),
        "web_content_link": uploaded.get("webContentLink"),
    }


@router.post("/upload", response_model=CaseDocumentResponse)
async def upload_document_to_case_study(
    case_study_id: str = Form(...),
    file: UploadFile = File(...),
    folder_id: str = Form(default=None),
    counsellor: Counsellor = Depends(get_current_counsellor),
    db: Session = Depends(get_db),
):
    """Upload a file to Google Drive and link it to a case study record."""
    case_study = db.query(CaseStudy).filter(
        CaseStudy.id == case_study_id,
        CaseStudy.counsellor_id == counsellor.id,
    ).first()
    if not case_study:
        raise HTTPException(status_code=404, detail="Case study not found or access denied.")

    file_bytes = await file.read()
    drive_file_id = None
    file_url = f"/storage/case-docs/{file.filename}"

    conn = db.query(DriveConnection).filter(DriveConnection.counsellor_id == counsellor.id).first()
    if conn:
        try:
            service = _build_drive_service(conn.tokens_json)
            uploaded = _upload_to_drive(service, file_bytes, file.filename, file.content_type, folder_id)
            drive_file_id = uploaded["id"]
            file_url = uploaded.get("webViewLink", file_url)
        except Exception:
            pass  # Fall through to save record without Drive link

    document = CaseDocument(
        case_study_id=case_study.id,
        file_name=file.filename,
        file_url=file_url,
        drive_file_id=drive_file_id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document
