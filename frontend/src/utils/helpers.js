import { SCORE_COLORS, FILLER_WORDS } from "./constants";

// ── Score utilities ───────────────────────────────────────────────────────────

export function getScoreLevel(score) {
  if (!score) return SCORE_COLORS.needs_work;
  if (score >= SCORE_COLORS.excellent.min) return SCORE_COLORS.excellent;
  if (score >= SCORE_COLORS.good.min) return SCORE_COLORS.good;
  return SCORE_COLORS.needs_work;
}

export function getScoreColor(score) {
  return getScoreLevel(score).color;
}

export function getScoreBg(score) {
  return getScoreLevel(score).bg;
}

export function formatScore(score) {
  if (score == null) return "N/A";
  return `${Math.round(score)}`;
}

// ── Date utilities ────────────────────────────────────────────────────────────

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function timeAgo(dateString) {
  if (!dateString) return "N/A";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// ── Speech utilities ──────────────────────────────────────────────────────────

export function countFillerWords(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of FILLER_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

export function calculateWordsPerMinute(text, durationSeconds) {
  if (!text || !durationSeconds) return 0;
  const words = text.trim().split(/\s+/).length;
  const minutes = durationSeconds / 60;
  return Math.round(words / minutes);
}

// ── Text utilities ────────────────────────────────────────────────────────────

export function truncate(str, maxLength = 100) {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

export function parseJsonList(rawStr) {
  if (!rawStr) return [];
  try {
    const parsed = JSON.parse(rawStr);
    return Array.isArray(parsed) ? parsed : [rawStr];
  } catch {
    return [rawStr];
  }
}

// ── Storage utilities ─────────────────────────────────────────────────────────

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}
