from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ─── Interview Message Schemas ────────────────────────────────────────────────

class InterviewMessageCreate(BaseModel):
    content: str
    role: str
    message_type: Optional[str] = "message"


class InterviewMessageResponse(BaseModel):
    id: int
    interview_id: int
    role: str
    content: str
    message_type: str
    score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Interview Schemas ────────────────────────────────────────────────────────

class InterviewCreate(BaseModel):
    role: str
    topic: str
    difficulty: str        # easy | medium | hard
    interview_type: str    # hr | technical | behavioral
    resume_id: Optional[int] = None


class InterviewResponse(BaseModel):
    id: int
    user_id: int
    title: str
    role: str
    topic: str
    difficulty: str
    interview_type: str
    status: str
    overall_score: Optional[float]
    communication_score: Optional[float]
    technical_score: Optional[float]
    confidence_score: Optional[float]
    eye_contact_score: Optional[float]
    emotion_score: Optional[float]
    speech_score: Optional[float]
    total_questions: int
    answered_questions: int
    duration_minutes: Optional[float]
    filler_words_count: int
    ai_feedback: Optional[str]
    strengths: Optional[str]
    weaknesses: Optional[str]
    improvement_suggestions: Optional[str]
    transcript: Optional[str]
    created_at: datetime
    messages: Optional[List[InterviewMessageResponse]] = []

    class Config:
        from_attributes = True


class InterviewUpdate(BaseModel):
    status: Optional[str] = None
    overall_score: Optional[float] = None
    communication_score: Optional[float] = None
    technical_score: Optional[float] = None
    confidence_score: Optional[float] = None
    eye_contact_score: Optional[float] = None
    emotion_score: Optional[float] = None
    speech_score: Optional[float] = None
    total_questions: Optional[int] = None
    answered_questions: Optional[int] = None
    duration_minutes: Optional[float] = None
    filler_words_count: Optional[int] = None
    ai_feedback: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    improvement_suggestions: Optional[str] = None
    transcript: Optional[str] = None


# ─── AI Request Schemas ───────────────────────────────────────────────────────

class AIQuestionRequest(BaseModel):
    interview_id: int
    role: str
    topic: str
    difficulty: str
    interview_type: str
    previous_messages: Optional[List[dict]] = []
    resume_context: Optional[str] = None


class AIEvaluationRequest(BaseModel):
    interview_id: int
    question: str
    answer: str
    role: str
    topic: str


class AIFeedbackRequest(BaseModel):
    interview_id: int
    transcript: str
    role: str
    interview_type: str
    scores: dict


# ─── Analytics Schema ─────────────────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    total_interviews: int
    average_score: float
    average_confidence: float
    average_eye_contact: float
    average_communication: float
    recent_interviews: List[InterviewResponse]
    score_trend: List[dict]


# ─── Resume Schemas ───────────────────────────────────────────────────────────

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    extracted_skills: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
