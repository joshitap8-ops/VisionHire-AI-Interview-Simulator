// ── API ───────────────────────────────────────────────────────────────────────
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ── Interview Options ─────────────────────────────────────────────────────────
export const INTERVIEW_TYPES = [
  {
    value: "hr",
    label: "HR Interview",
    description: "Personality, motivation, cultural fit",
    icon: "👥",
    color: "from-blue-500 to-cyan-500",
  },
  {
    value: "technical",
    label: "Technical Interview",
    description: "Coding, system design, domain expertise",
    icon: "💻",
    color: "from-violet-500 to-purple-500",
  },
  {
    value: "behavioral",
    label: "Behavioral Interview",
    description: "STAR method, past experiences, leadership",
    icon: "🎯",
    color: "from-pink-500 to-rose-500",
  },
];

export const DIFFICULTY_LEVELS = [
  {
    value: "easy",
    label: "Easy",
    description: "Introductory questions for beginners",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Practical knowledge and experience",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Advanced expert-level challenges",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
  },
];

export const POPULAR_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Data Analyst",
  "Cloud Architect",
  "Mobile Developer",
  "QA Engineer",
  "Cybersecurity Analyst",
];

export const POPULAR_TOPICS = [
  "JavaScript & React",
  "Python & Django",
  "Data Structures & Algorithms",
  "System Design",
  "Machine Learning",
  "Cloud Computing (AWS/GCP/Azure)",
  "Database Design",
  "REST APIs & Microservices",
  "DevOps & CI/CD",
  "Computer Networks",
  "Operating Systems",
  "Behavioral & Soft Skills",
  "Leadership & Management",
  "Problem Solving",
];

// ── Score Thresholds ──────────────────────────────────────────────────────────
export const SCORE_COLORS = {
  excellent: { min: 80, color: "#10b981", label: "Excellent", bg: "bg-emerald-500/20 text-emerald-400" },
  good: { min: 60, color: "#f59e0b", label: "Good", bg: "bg-amber-500/20 text-amber-400" },
  needs_work: { min: 0, color: "#ef4444", label: "Needs Work", bg: "bg-red-500/20 text-red-400" },
};

// ── Filler Words ──────────────────────────────────────────────────────────────
export const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "literally", "actually", "right", "so"];
