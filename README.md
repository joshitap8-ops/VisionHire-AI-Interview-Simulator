# VisionHire – AI-Powered Interview Intelligence Platform

A full-stack AI interview platform that uses **Mistral AI (via Ollama)**, **MediaPipe**, and the **Web Speech API** to simulate real interviews with live emotion tracking, eye contact scoring, and speech analytics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, Framer Motion |
| Backend | FastAPI, Python 3.10+ |
| AI | Ollama + Mistral model |
| Speech | Web Speech API (browser-native) |
| Computer Vision | MediaPipe FaceMesh, HTML5 Canvas |
| Database | SQLite + SQLAlchemy |
| Auth | JWT (python-jose + bcrypt) |
| PDF | ReportLab |

---

## Features

- **AI Interview Engine** – HR, Technical, Behavioral interviews with dynamic follow-up questions
- **Eye Contact Tracking** – Real-time gaze estimation using webcam
- **Emotion Detection** – Confidence scoring based on speech and facial analysis
- **Live Speech-to-Text** – Web Speech API transcription with filler word detection
- **Resume Upload** – PDF parsing with AI skill extraction
- **Performance Dashboard** – Charts, score trends, and analytics
- **PDF Reports** – Downloadable interview reports with full feedback
- **Interview History** – All past sessions with scores and transcripts
- **Dark Mode UI** – Modern glassmorphism design with smooth animations

---

## Prerequisites

1. **Python 3.10+** – [python.org](https://python.org)
2. **Node.js 18+** – [nodejs.org](https://nodejs.org)
3. **Ollama** – [ollama.ai](https://ollama.ai)
4. **Google Chrome** – Required for Web Speech API

---

## Setup & Installation

### Step 1 – Install and start Ollama

```bash
# Download from https://ollama.ai and install
# Then pull the Mistral model:
ollama pull phi4

# Start Ollama (it usually starts automatically)
ollama serve
```

### Step 2 – Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Start the backend server
python main.py
# or
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: **http://localhost:8000**
API docs available at: **http://localhost:8000/docs**

### Step 3 – Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Start the development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Screen Shots
<img width="1896" height="906" alt="frontpage" src="https://github.com/user-attachments/assets/de9bfa39-2077-413d-bc29-703484152306" />

## Project Structure

```
InterviewProject/
├── backend/
│   ├── main.py                     # FastAPI entry point
│   ├── requirements.txt
│   ├── .env                        # Environment variables
│   └── app/
│       ├── database.py             # SQLAlchemy setup
│       ├── models/
│       │   ├── database_models.py  # ORM models (User, Interview, etc.)
│       │   └── schemas.py          # Pydantic request/response schemas
│       ├── routes/
│       │   ├── auth.py             # Login, register, profile
│       │   ├── interview.py        # Interview CRUD + AI endpoints
│       │   ├── resume.py           # PDF upload & parsing
│       │   ├── analytics.py        # Dashboard analytics
│       │   └── reports.py          # PDF report generation
│       ├── services/
│       │   ├── auth_service.py     # JWT, bcrypt, user management
│       │   ├── interview_service.py# Interview orchestration logic
│       │   └── resume_service.py   # PDF text + skill extraction
│       ├── ai/
│       │   ├── ollama_client.py    # Ollama HTTP client
│       │   └── question_generator.py # Question, evaluation, feedback prompts
│       └── utils/
│           ├── pdf_generator.py    # ReportLab PDF builder
│           └── speech_analyzer.py  # Server-side speech text analysis
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                 # Router + auth guards
        ├── context/
        │   └── AuthContext.jsx     # Global auth state
        ├── pages/
        │   ├── LandingPage.jsx     # Marketing homepage
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── Dashboard.jsx       # Main dashboard with analytics
        │   ├── InterviewSetup.jsx  # 4-step interview configuration
        │   ├── InterviewSession.jsx# Live interview with webcam + AI
        │   ├── InterviewReport.jsx # Post-interview results
        │   ├── History.jsx         # Interview history list
        │   └── Profile.jsx         # User profile & resume
        ├── components/
        │   ├── Navbar.jsx
        │   ├── WebcamPreview.jsx   # Live camera feed
        │   ├── SpeechToText.jsx    # Microphone + transcript panel
        │   ├── EyeContactTracker.jsx # Gaze detection & score
        │   ├── EmotionDisplay.jsx  # Emotion & confidence analytics
        │   ├── InterviewChat.jsx   # Q&A conversation bubbles
        │   ├── AnalyticsChart.jsx  # Recharts (line, bar, radar)
        │   ├── ScoreCard.jsx       # Score ring, stat bubble, card
        │   ├── ResumeUpload.jsx    # Drag & drop PDF upload
        │   └── LoadingSpinner.jsx
        ├── hooks/
        │   ├── useWebcam.js        # Camera stream management
        │   ├── useSpeech.js        # Web Speech API wrapper
        │   └── useInterview.js     # Interview state machine
        ├── services/
        │   ├── api.js              # Axios instance with JWT interceptors
        │   ├── authService.js      # Auth API calls
        │   └── interviewService.js # Interview/analytics/resume API calls
        └── utils/
            ├── constants.js        # Interview types, roles, topics
            └── helpers.js          # Score colors, formatters, storage
```

---

## Application Flow

```
User Login/Signup
      ↓
    Dashboard
      ↓
Upload Resume (optional – for tailored questions)
      ↓
Interview Setup (Type → Role/Topic → Difficulty → Review)
      ↓
Live Interview Session
 ├── Webcam activated + face detection
 ├── AI generates questions via Mistral
 ├── Speech-to-text captures answers
 ├── Eye contact tracked every 1.5 seconds
 ├── Emotion estimated from speech analytics
 └── AI evaluates each answer in real time
      ↓
End Interview → AI generates comprehensive feedback
      ↓
Report Page (scores, radar chart, strengths/weaknesses, transcript)
      ↓
Download PDF Report
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/interview/create` | Start new interview |
| GET | `/api/interview/list` | List user interviews |
| GET | `/api/interview/{id}/next-question` | AI generates next question |
| POST | `/api/interview/{id}/evaluate-answer` | AI scores an answer |
| POST | `/api/interview/{id}/complete` | Finish + generate feedback |
| POST | `/api/resume/upload` | Upload PDF resume |
| GET | `/api/analytics/dashboard` | Dashboard statistics |
| GET | `/api/reports/{id}/pdf` | Download PDF report |

---

## Environment Variables

### Backend (`backend/.env`)
```
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./visionhire.db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:8000
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| AI not responding | Ensure `ollama serve` is running and `ollama run mistral` has been executed |
| Speech recognition not working | Use Google Chrome; grant microphone permission |
| Camera not working | Allow camera permission in browser |
| CORS error | Check backend `ALLOWED_ORIGINS` matches your frontend URL |
| PDF generation fails | Install `reportlab`: `pip install reportlab` |

---

## Built With ❤️ by VisionHire Team
