import axios from "axios";

/**
 * Axios instance pre-configured for future backend integration.
 * When the real API (Node.js + Express + PostgreSQL) is ready,
 * services should call `api.get/post/put/delete` instead of the mock store.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // Central error handling hook — extend with toasts / logout on 401 etc.
    return Promise.reject(error);
  },
);
