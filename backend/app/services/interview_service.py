import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.database_models import Interview, InterviewMessage, Resume
from app.models.schemas import InterviewCreate, InterviewUpdate, InterviewResponse
from app.ai.question_generator import (
    generate_first_question,
    generate_follow_up_question,
    evaluate_answer,
    generate_comprehensive_feedback,
)


def create_interview(db: Session, user_id: int, data: InterviewCreate) -> Interview:
    """Create a new interview session record."""
    title = f"{data.interview_type.upper()} Interview – {data.role} ({data.difficulty})"
    interview = Interview(
        user_id=user_id,
        title=title,
        role=data.role,
        topic=data.topic,
        difficulty=data.difficulty,
        interview_type=data.interview_type,
        status="active",
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


def get_interview(db: Session, interview_id: int, user_id: int) -> Interview:
    """Fetch a single interview; raises 404 if not found or not owned by user."""
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user_id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


def get_user_interviews(db: Session, user_id: int, limit: int = 20) -> list:
    """Return the N most recent interviews for a user."""
    return (
        db.query(Interview)
        .filter(Interview.user_id == user_id)
        .order_by(Interview.created_at.desc())
        .limit(limit)
        .all()
    )


def update_interview(db: Session, interview_id: int, user_id: int, data: InterviewUpdate) -> Interview:
    """Partially update an interview record."""
    interview = get_interview(db, interview_id, user_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(interview, field, value)
    db.commit()
    db.refresh(interview)
    return interview


def add_message(db: Session, interview_id: int, role: str, content: str,
                message_type: str = "message", score: float = None) -> InterviewMessage:
    """Append a message to an interview conversation."""
    msg = InterviewMessage(
        interview_id=interview_id,
        role=role,
        content=content,
        message_type=message_type,
        score=score,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


async def get_next_question(db: Session, interview_id: int, user_id: int) -> str:
    """
    Determine what question to ask next based on conversation history.
    Returns the AI-generated question text.
    """
    interview = get_interview(db, interview_id, user_id)
    messages = (
        db.query(InterviewMessage)
        .filter(InterviewMessage.interview_id == interview_id)
        .order_by(InterviewMessage.created_at)
        .all()
    )

    # Fetch resume context if available
    resume_context = None
    resume = db.query(Resume).filter(
        Resume.user_id == user_id, Resume.is_active == True
    ).first()
    if resume and resume.extracted_text:
        resume_context = resume.extracted_text[:800]

    question_count = sum(1 for m in messages if m.role == "ai" and m.message_type == "question")

    if question_count == 0:
        # First question
        question = await generate_first_question(
            role=interview.role,
            topic=interview.topic,
            difficulty=interview.difficulty,
            interview_type=interview.interview_type,
            resume_context=resume_context,
        )
    else:
        # Build conversation history for context
        history = [
            {"role": m.role if m.role == "user" else "assistant", "content": m.content}
            for m in messages
        ]
        question = await generate_follow_up_question(
            role=interview.role,
            topic=interview.topic,
            difficulty=interview.difficulty,
            interview_type=interview.interview_type,
            conversation_history=history,
            question_number=question_count + 1,
            total_questions=7,
        )

    # Store the question
    add_message(db, interview_id, "ai", question, message_type="question")
    db.query(Interview).filter(Interview.id == interview_id).update(
        {"total_questions": question_count + 1}
    )
    db.commit()

    return question


async def evaluate_user_answer(
    db: Session, interview_id: int, user_id: int, question: str, answer: str
) -> dict:
    """Evaluate a user's answer and store it."""
    interview = get_interview(db, interview_id, user_id)

    result = await evaluate_answer(
        question=question,
        answer=answer,
        role=interview.role,
        topic=interview.topic,
        interview_type=interview.interview_type,
    )

    # Store the answer with the score
    add_message(
        db, interview_id, "user", answer,
        message_type="answer",
        score=result["score"],
    )

    # Update answered count
    current = db.query(Interview).filter(Interview.id == interview_id).first()
    db.query(Interview).filter(Interview.id == interview_id).update(
        {"answered_questions": (current.answered_questions or 0) + 1}
    )
    db.commit()

    return result


async def complete_interview(
    db: Session, interview_id: int, user_id: int, analytics_data: dict
) -> Interview:
    """
    Finalize an interview: compute scores, generate AI feedback, and save.
    analytics_data should contain: eye_contact_score, emotion_score, speech_score,
    filler_words_count, duration_minutes, transcript
    """
    interview = get_interview(db, interview_id, user_id)
    messages = (
        db.query(InterviewMessage)
        .filter(InterviewMessage.interview_id == interview_id)
        .all()
    )

    # Build full transcript
    transcript_lines = []
    for m in messages:
        label = "Interviewer" if m.role == "ai" else "Candidate"
        transcript_lines.append(f"{label}: {m.content}")
    full_transcript = "\n\n".join(transcript_lines)

    # Calculate answer score average
    answer_scores = [m.score for m in messages if m.role == "user" and m.score is not None]
    avg_answer_score = (sum(answer_scores) / len(answer_scores) * 10) if answer_scores else 60.0

    # Scores from analytics data
    eye_contact = analytics_data.get("eye_contact_score", 70.0)
    emotion = analytics_data.get("emotion_score", 65.0)
    speech = analytics_data.get("speech_score", 70.0)
    communication = (avg_answer_score * 0.5 + speech * 0.5)
    confidence = (emotion * 0.6 + eye_contact * 0.4)
    overall = (avg_answer_score * 0.4 + communication * 0.2 + confidence * 0.2 + eye_contact * 0.2)

    scores = {
        "Overall": round(overall, 1),
        "Technical/Content": round(avg_answer_score, 1),
        "Communication": round(communication, 1),
        "Confidence": round(confidence, 1),
        "Eye Contact": round(eye_contact, 1),
        "Speech Clarity": round(speech, 1),
    }

    # Generate AI feedback
    feedback_data = await generate_comprehensive_feedback(
        role=interview.role,
        interview_type=interview.interview_type,
        transcript=full_transcript,
        scores=scores,
    )

    # Persist everything
    update_data = InterviewUpdate(
        status="completed",
        overall_score=round(overall, 1),
        communication_score=round(communication, 1),
        technical_score=round(avg_answer_score, 1),
        confidence_score=round(confidence, 1),
        eye_contact_score=round(eye_contact, 1),
        emotion_score=round(emotion, 1),
        speech_score=round(speech, 1),
        filler_words_count=analytics_data.get("filler_words_count", 0),
        duration_minutes=analytics_data.get("duration_minutes", 0),
        ai_feedback=feedback_data.get("overall_feedback", ""),
        strengths=json.dumps(feedback_data.get("strengths", [])),
        weaknesses=json.dumps(feedback_data.get("weaknesses", [])),
        improvement_suggestions=json.dumps(
            feedback_data.get("improvement_suggestions", [])
            + feedback_data.get("communication_tips", [])
        ),
        transcript=full_transcript,
    )

    return update_interview(db, interview_id, user_id, update_data)
