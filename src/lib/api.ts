const API_BASE = import.meta.env.VITE_FASTAPI_URL || "http://127.0.0.1:8000/api";

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("aasare_token") : null;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Network response error" }));
    throw new Error(errorData.detail || `Error ${response.status}`);
  }

  return response.json();
}
