// Best-effort activity logger used by frontend.
// Safe: does not require any other local helper files.

// src/utils/logActivity.js
import api from './api.js'

function formatExpiry(iso) {
  if (!iso) return null
  try { return new Date(iso).toISOString() } catch { return null }
}

const TYPE_MAP = {
  'item:add': { verb: 'New item added', emoji: '🆕' },
  'item:update': { verb: 'Item updated', emoji: '✏️' },
  'item:delete': { verb: 'Item deleted', emoji: '🗑️' },
  'mail:sent': { verb: 'Email sent', emoji: '✉️' },
  'auth:login': { verb: 'Logged in', emoji: '🔑' },
  'auth:logout': { verb: 'Signed out', emoji: '🚪' }
}

function buildBrief({ type, message, meta = {}, userName = null }) {
  const t = TYPE_MAP[type] || { verb: message || type, emoji: 'ℹ️' }
  const item = meta?.item || {}
  const name = item?.name || meta?.itemName
  const expiry = item?.expiryDate || meta?.expiryDate
  if (type === 'item:add' && name) return `Added — ${name}${expiry ? ` · Expires ${new Date(expiry).toLocaleDateString()}` : ''}`
  if (type === 'item:update' && name) {
    if (Array.isArray(meta.changes) && meta.changes.length) {
      const small = meta.changes.slice(0,3).map(c => `${c.field}:${c.from ?? ''}→${c.to ?? ''}`).join(', ')
      return `Updated — ${name}${small ? ` · ${small}` : ''}`
    }
    return `Updated — ${name}`
  }
  if (type === 'item:delete' && name) return `Deleted — ${name}${expiry ? ` · Expiry ${new Date(expiry).toLocaleDateString()}` : ''}`
  if (type === 'mail:sent') {
    const to = Array.isArray(meta.to) ? meta.to.join(', ') : (meta.to || '')
    return `Email: ${message}${to ? ` — sent to ${to}` : ''}`
  }
  if (type === 'auth:login') return `User logged in — ${userName || (meta?.email || '')}`
  if (type === 'auth:logout') return `User signed out — ${userName || (meta?.email || '')}`
  return message || t.verb || 'Activity'
}

/**
 * logActivity - best-effort activity logger
 * payload: { type, message, meta, userId, userName }
 */
export default async function logActivity({ type, message, meta = {}, userId = null, userName = null } = {}) {
  if (!type || !message) return
  const body = {
    type,
    message,
    meta,
    userId,
    userName,
    verb: (TYPE_MAP[type] && TYPE_MAP[type].verb) || null,
    emoji: (TYPE_MAP[type] && TYPE_MAP[type].emoji) || null,
    itemName: (meta?.item?.name || meta?.itemName) || null,
    expiryDate: formatExpiry(meta?.item?.expiryDate || meta?.expiryDate),
    brief: buildBrief({ type, message, meta, userName }),
    details: meta,
    createdAt: new Date().toISOString()
  }

  try {
    await api.post('/activity', body)
  } catch (err) {
    // swallow silently
  }
}
