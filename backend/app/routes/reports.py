from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.interview_service import get_interview
from app.utils.pdf_generator import generate_interview_pdf

router = APIRouter()


@router.get("/{interview_id}/pdf")
async def download_pdf_report(
    interview_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and return a PDF interview report as a file download."""
    interview = get_interview(db, interview_id, current_user.id)

    if interview.status != "completed":
        raise HTTPException(
            status_code=400, detail="Interview is not yet completed"
        )

    pdf_bytes = generate_interview_pdf(interview, current_user)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="VisionHire_Report_{interview_id}.pdf"'
            )
        },
    )
