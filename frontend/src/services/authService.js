import api from "./api";
import { saveToStorage, removeFromStorage } from "../utils/helpers";

// ── Register ──────────────────────────────────────────────────────────────────
export async function register({ email, username, full_name, password }) {
  const { data } = await api.post("/api/auth/register", {
    email,
    username,
    full_name,
    password,
  });
  saveToStorage("visionhire_token", data.access_token);
  saveToStorage("visionhire_user", data.user);
  return data;
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const { data } = await api.post("/api/auth/login", { email, password });
  saveToStorage("visionhire_token", data.access_token);
  saveToStorage("visionhire_user", data.user);
  return data;
}

// ── Get current user profile ──────────────────────────────────────────────────
export async function getMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

// ── Update profile ────────────────────────────────────────────────────────────
export async function updateProfile(fullName) {
  const { data } = await api.put(`/api/auth/profile?full_name=${encodeURIComponent(fullName)}`);
  saveToStorage("visionhire_user", data);
  return data;
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function logout() {
  removeFromStorage("visionhire_token");
  removeFromStorage("visionhire_user");
}
