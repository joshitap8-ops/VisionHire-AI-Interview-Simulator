import axios from "axios";
import { API_URL } from "../utils/constants";
import { loadFromStorage, removeFromStorage } from "../utils/helpers";

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for AI calls
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor – attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = loadFromStorage("visionhire_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor – handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeFromStorage("visionhire_token");
      removeFromStorage("visionhire_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
