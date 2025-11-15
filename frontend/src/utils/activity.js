// src/utils/activity.js
import api from './api.js';

/**
 * logActivity - best-effort client helper to send activity to backend
 * payload: { userId, userName, type, message, meta }
 */
export async function logActivity(payload = {}) {
  try {
    await api.post('/activity', payload);
  } catch (err) {
    // fail silently - activity logging should not break UX
    // You can optionally console.debug for dev:
    // console.debug('logActivity failed', err?.response?.data || err.message);
  }
}
