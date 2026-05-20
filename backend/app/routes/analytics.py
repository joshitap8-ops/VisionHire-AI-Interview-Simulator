from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.database_models import Interview
from app.models.schemas import AnalyticsResponse, InterviewResponse
from app.services.auth_service import get_current_user

router = APIRouter()


@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_analytics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return aggregated analytics for the user dashboard."""
    interviews = (
        db.query(Interview)
        .filter(
            Interview.user_id == current_user.id,
            Interview.status == "completed",
        )
        .order_by(Interview.created_at.desc())
        .all()
    )

    total = len(interviews)

    def safe_avg(values):
        vals = [v for v in values if v is not None]
        return round(sum(vals) / len(vals), 1) if vals else 0.0

    avg_score = safe_avg([i.overall_score for i in interviews])
    avg_confidence = safe_avg([i.confidence_score for i in interviews])
    avg_eye_contact = safe_avg([i.eye_contact_score for i in interviews])
    avg_communication = safe_avg([i.communication_score for i in interviews])

    # Trend: last 10 interviews for chart
    recent = interviews[:10]
    score_trend = [
        {
            "date": i.created_at.strftime("%b %d"),
            "overall": i.overall_score or 0,
            "communication": i.communication_score or 0,
            "confidence": i.confidence_score or 0,
        }
        for i in reversed(recent)
    ]

    return AnalyticsResponse(
        total_interviews=total,
        average_score=avg_score,
        average_confidence=avg_confidence,
        average_eye_contact=avg_eye_contact,
        average_communication=avg_communication,
        recent_interviews=[InterviewResponse.model_validate(i) for i in recent],
        score_trend=score_trend,
    )
