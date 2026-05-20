from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.schemas import ResumeResponse
from app.services.auth_service import get_current_user
from app.services.resume_service import upload_resume, get_user_resumes, get_active_resume

router = APIRouter()


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a PDF resume, extract text and skills."""
    return await upload_resume(db, current_user.id, file)


@router.get("/list", response_model=List[ResumeResponse])
async def list_resumes(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all uploaded resumes for the current user."""
    return get_user_resumes(db, current_user.id)


@router.get("/active", response_model=ResumeResponse)
async def get_active_resume_info(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the currently active resume."""
    resume = get_active_resume(db, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="No active resume found")
    return resume
