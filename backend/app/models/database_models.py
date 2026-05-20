from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """Registered user model for authentication and profile data."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    interviews = relationship("Interview", back_populates="user", cascade="all, delete")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete")


class Interview(Base):
    """Stores each interview session with scores and AI feedback."""
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    role = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)       # easy | medium | hard
    interview_type = Column(String, nullable=False)   # hr | technical | behavioral
    status = Column(String, default="pending")        # pending | active | completed

    # Scores (0-100 scale)
    overall_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    eye_contact_score = Column(Float, nullable=True)
    emotion_score = Column(Float, nullable=True)
    speech_score = Column(Float, nullable=True)

    # Analytics
    total_questions = Column(Integer, default=0)
    answered_questions = Column(Integer, default=0)
    duration_minutes = Column(Float, nullable=True)
    filler_words_count = Column(Integer, default=0)
    average_response_time = Column(Float, nullable=True)

    # AI-generated feedback
    ai_feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    improvement_suggestions = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="interviews")
    messages = relationship(
        "InterviewMessage", back_populates="interview", cascade="all, delete"
    )


class InterviewMessage(Base):
    """Individual question/answer pairs within an interview session."""
    __tablename__ = "interview_messages"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    role = Column(String, nullable=False)           # ai | user
    content = Column(Text, nullable=False)
    message_type = Column(String, default="message")  # question | answer | feedback
    score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interview = relationship("Interview", back_populates="messages")


class Resume(Base):
    """Uploaded resume with extracted text and skills."""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)
    extracted_skills = Column(Text, nullable=True)   # JSON-encoded list
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resumes")
