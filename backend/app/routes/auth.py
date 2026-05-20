from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import create_user, authenticate_user, get_current_user

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account and return a JWT token."""
    return create_user(db, user_data)


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return a JWT access token."""
    return authenticate_user(db, user_data)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    full_name: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's display name."""
    current_user.full_name = full_name
    db.commit()
    db.refresh(current_user)
    return current_user
