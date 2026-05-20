import api from "./api";

// ── Create a new interview session ────────────────────────────────────────────
export async function createInterview({ role, topic, difficulty, interview_type, resume_id }) {
  const { data } = await api.post("/api/interview/create", {
    role,
    topic,
    difficulty,
    interview_type,
    resume_id: resume_id || null,
  });
  return data;
}

// ── List all interviews for current user ──────────────────────────────────────
export async function listInterviews() {
  const { data } = await api.get("/api/interview/list");
  return data;
}

// ── Get a single interview with messages ──────────────────────────────────────
export async function getInterview(interviewId) {
  const { data } = await api.get(`/api/interview/${interviewId}`);
  return data;
}

// ── Fetch next AI question ────────────────────────────────────────────────────
export async function getNextQuestion(interviewId) {
  const { data } = await api.get(`/api/interview/${interviewId}/next-question`);
  return data.question;
}

// ── Submit answer for evaluation ──────────────────────────────────────────────
export async function evaluateAnswer(interviewId, question, answer) {
  const { data } = await api.post(`/api/interview/${interviewId}/evaluate-answer`, {
    question,
    answer,
  });
  return data; // { score, feedback }
}

// ── Complete interview and generate final feedback ────────────────────────────
export async function completeInterview(interviewId, analyticsData) {
  const { data } = await api.post(`/api/interview/${interviewId}/complete`, analyticsData);
  return data;
}

// ── Patch interview with partial data ─────────────────────────────────────────
export async function patchInterview(interviewId, updateData) {
  const { data } = await api.patch(`/api/interview/${interviewId}`, updateData);
  return data;
}

// ── Get dashboard analytics ───────────────────────────────────────────────────
export async function getDashboardAnalytics() {
  const { data } = await api.get("/api/analytics/dashboard");
  return data;
}

// ── Upload resume PDF ─────────────────────────────────────────────────────────
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── List all resumes ──────────────────────────────────────────────────────────
export async function listResumes() {
  const { data } = await api.get("/api/resume/list");
  return data;
}

// ── Get active resume ─────────────────────────────────────────────────────────
export async function getActiveResume() {
  try {
    const { data } = await api.get("/api/resume/active");
    return data;
  } catch {
    return null;
  }
}

// ── Download PDF report ───────────────────────────────────────────────────────
export async function downloadPdfReport(interviewId) {
  const response = await api.get(`/api/reports/${interviewId}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `VisionHire_Report_${interviewId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
