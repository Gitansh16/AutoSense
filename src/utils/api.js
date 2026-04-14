// src/utils/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getToken() {
  return localStorage.getItem('token');
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return null;
  }

  return res;
}

export async function askAIChatbot(message, history = []) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `Chat request failed (${res.status})`);
  }

  return data;
}