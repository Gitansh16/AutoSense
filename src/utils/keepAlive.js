// src/utils/keepAlive.js
// Pings the backend every 10 minutes to prevent Render free tier sleep

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PING_INTERVAL_MS = 10 * 60 * 1000;
const INITIAL_DELAY_MS = 5 * 1000;

let started = false;
let intervalId = null;

function shouldKeepAlive() {
  if (API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')) {
    return false;
  }
  return true;
}

function pingBackend() {
  fetch(`${API_BASE}/`).catch(() => {});
}

export function startKeepAlive() {
  if (started || !shouldKeepAlive()) {
    return;
  }

  started = true;

  setTimeout(() => {
    if (document.visibilityState === 'visible') {
      pingBackend();
    }
  }, INITIAL_DELAY_MS);

  intervalId = setInterval(() => {
    if (document.visibilityState === 'visible') {
      pingBackend();
    }
  }, PING_INTERVAL_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && intervalId) {
      pingBackend();
    }
  });
}