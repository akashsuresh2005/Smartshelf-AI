
// src/utils/api.js
import axios from 'axios';

/**
 * IMPORTANT:
 * - In production → VITE_API_BASE_URL must be:
 *   https://smartshelf-ai-production.up.railway.app/api
 *
 * - In local dev fallback → http://localhost:8080/api
 */
const ROOT =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

// ------------------------------------------------------------
// Axios instance
// ------------------------------------------------------------
const api = axios.create({
  baseURL: ROOT,
  withCredentials: true, // REQUIRED for CORS + cookies
  timeout: 20000
});

// ------------------------------------------------------------
// Path Normalizer
// Prevents /api/api duplication
// ------------------------------------------------------------
function normalizePath(baseURL, url) {
  if (!url || typeof url !== 'string') return url;

  // Allow absolute URLs
  if (/^https?:\/\//i.test(url)) return url;

  let u = url.replace(/^\/+/, '/');

  const baseEndsWithApi =
    typeof baseURL === 'string' && /\/api\/?$/.test(baseURL);

  if (baseEndsWithApi && /^\/?api(\/|$)/i.test(u)) {
    u = u.replace(/^\/?api(\/|$)/i, '/');
  }

  if (!u.startsWith('/')) u = `/${u}`;

  return u;
}

// ------------------------------------------------------------
// Request Interceptor
// ------------------------------------------------------------
api.interceptors.request.use((cfg) => {
  const config = cfg || {};

  try {
    let token = null;
    try {
      token =
        typeof window !== 'undefined' &&
        window.localStorage?.getItem
          ? window.localStorage.getItem('token')
          : null;
    } catch {
      token = null;
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.url = normalizePath(api.defaults.baseURL, config.url);
  } catch (err) {
    console.error('[api interceptor error]', err);
  }

  return config;
});

// ------------------------------------------------------------
// Response Interceptor
// ------------------------------------------------------------
api.interceptors.response.use(
  (res) => {
    const contentType = res.headers['content-type'];

    // chatbot text responses
    if (contentType && contentType.includes('text/plain')) {
      return res.data;
    }

    return res.data;
  },
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      try { localStorage.removeItem('token'); } catch {}
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(err);
  }
);

export default api;

