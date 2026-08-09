from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Counsellor, UserRole
from app.schemas import UserSignUp, UserSignIn, Token, UserResponse
from app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserSignUp, db: Session = Depends(get_db)):
    # Check existing user
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # Validate role
    assigned_role = user_in.role if user_in.role in [r.value for r in UserRole] else UserRole.STUDENT.value

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        usn=user_in.usn.upper() if user_in.usn else None,
        department=user_in.department,
        year=user_in.year,
        role=assigned_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If role is counsellor, create counsellor record automatically if not created
    if assigned_role == UserRole.COUNSELLOR.value:
        counsellor = Counsellor(
            user_id=new_user.id,
            name=new_user.full_name,
            designation="Faculty Counsellor",
            department=new_user.department or "General",
            bio="Faculty Counsellor at SMVITM."
        )
        db.add(counsellor)
        db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/json-login", response_model=Token)
def json_login(user_in: UserSignIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
