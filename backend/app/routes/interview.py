from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.schemas import (
    InterviewCreate, InterviewResponse, InterviewUpdate, InterviewMessageResponse
)
from app.services.auth_service import get_current_user
from app.services.interview_service import (
    create_interview, get_interview, get_user_interviews,
    update_interview, add_message, get_next_question,
    evaluate_user_answer, complete_interview,
)

router = APIRouter()


@router.post("/create", response_model=InterviewResponse)
async def create_new_interview(
    data: InterviewCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new interview session."""
    interview = create_interview(db, current_user.id, data)
    return interview


@router.get("/list", response_model=List[InterviewResponse])
async def list_interviews(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all interviews for the current user."""
    return get_user_interviews(db, current_user.id)


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview_by_id(
    interview_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a single interview with all messages."""
    interview = get_interview(db, interview_id, current_user.id)
    return interview


@router.get("/{interview_id}/next-question")
async def next_question(
    interview_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and return the next AI interview question."""
    question = await get_next_question(db, interview_id, current_user.id)
    return {"question": question}


@router.post("/{interview_id}/evaluate-answer")
async def evaluate_answer(
    interview_id: int,
    payload: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evaluate a candidate's answer.
    Body: { "question": "...", "answer": "..." }
    """
    question = payload.get("question", "")
    answer = payload.get("answer", "")

    if not question or not answer:
        raise HTTPException(status_code=400, detail="Both question and answer are required")

    result = await evaluate_user_answer(db, interview_id, current_user.id, question, answer)
    return result


@router.post("/{interview_id}/complete", response_model=InterviewResponse)
async def complete_interview_session(
    interview_id: int,
    analytics_data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Complete an interview and generate AI feedback.
    Body: { eye_contact_score, emotion_score, speech_score, filler_words_count,
            duration_minutes, transcript }
    """
    interview = await complete_interview(db, interview_id, current_user.id, analytics_data)
    return interview


@router.patch("/{interview_id}", response_model=InterviewResponse)
async def patch_interview(
    interview_id: int,
    data: InterviewUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Partially update interview fields (e.g., during live session)."""
    return update_interview(db, interview_id, current_user.id, data)
