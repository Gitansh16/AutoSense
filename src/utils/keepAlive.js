// src/utils/keepAlive.js
// Pings the backend every 10 minutes to prevent Render free tier sleep

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function startKeepAlive() {
  // Initial ping after 5 seconds
  setTimeout(() => {
    fetch(`${API_BASE}/`).catch(() => {});
  }, 5000);

  // Then every 10 minutes
  setInterval(() => {
    fetch(`${API_BASE}/`).catch(() => {});
  }, 600000);
}