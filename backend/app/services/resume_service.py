import os
import json
import re
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import aiofiles

from app.models.database_models import Resume
from app.models.schemas import ResumeResponse
from app.ai.ollama_client import chat_with_ollama

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Common skill keywords for basic extraction fallback
COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI", "Django",
    "Flask", "Java", "C++", "C#", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "Linux", "Machine Learning",
    "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "REST API",
    "GraphQL", "HTML", "CSS", "Tailwind", "Vue", "Angular", "Spring Boot", "Microservices",
    "Agile", "Scrum", "CI/CD", "DevOps", "Data Analysis", "Pandas", "NumPy",
]


def extract_text_from_pdf(file_path: str) -> str:
    """Extract plain text from a PDF file using PyPDF2."""
    try:
        import PyPDF2
        text = []
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
        return "\n".join(text)
    except Exception as e:
        return f"Could not extract text: {str(e)}"


def extract_skills_basic(text: str) -> list:
    """Basic skill extraction by scanning for known keywords."""
    found = []
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        if skill.lower() in text_lower:
            found.append(skill)
    return found


async def extract_skills_with_ai(text: str) -> list:
    """Use Ollama to intelligently extract skills from resume text."""
    prompt = f"""Extract technical and soft skills from this resume text. 
Return ONLY a JSON array of skill strings. Example: ["Python", "React", "Leadership"]

Resume text:
{text[:2000]}

Return only the JSON array, nothing else."""

    messages = [{"role": "user", "content": prompt}]
    raw = await chat_with_ollama(messages)

    try:
        match = re.search(r'\[.*?\]', raw, re.DOTALL)
        if match:
            skills = json.loads(match.group())
            return [s for s in skills if isinstance(s, str)]
    except Exception:
        pass

    # Fallback to basic extraction
    return extract_skills_basic(text)


async def upload_resume(db: Session, user_id: int, file: UploadFile) -> ResumeResponse:
    """Save uploaded PDF, extract text and skills, persist to DB."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Save the file
    safe_name = f"user_{user_id}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    # Extract text
    extracted_text = extract_text_from_pdf(file_path)

    # Extract skills (try AI first, fallback to basic)
    try:
        skills = await extract_skills_with_ai(extracted_text)
    except Exception:
        skills = extract_skills_basic(extracted_text)

    # Mark all previous resumes as inactive
    db.query(Resume).filter(Resume.user_id == user_id).update({"is_active": False})

    # Create new resume record
    resume = Resume(
        user_id=user_id,
        filename=file.filename,
        file_path=file_path,
        extracted_text=extracted_text,
        extracted_skills=json.dumps(skills),
        is_active=True,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeResponse.model_validate(resume)


def get_active_resume(db: Session, user_id: int):
    """Return the active resume for a user."""
    return db.query(Resume).filter(
        Resume.user_id == user_id, Resume.is_active == True
    ).first()


def get_user_resumes(db: Session, user_id: int) -> list:
    """Return all resumes for a user ordered by newest first."""
    return (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .all()
    )
