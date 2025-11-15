// src/components/ActivityItem.jsx
import React, { useMemo, useState } from 'react'

function timeAgo(iso) {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

// Small helper to format dates as DD/MM/YYYY
function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

// Fallback/type map (keeps parity w/ server mapping)
const TYPE_MAP = {
  'item:add': { verb: 'New item added', emoji: '🆕', badge: 'bg-green-100 text-green-800' },
  'item:update': { verb: 'Item updated', emoji: '✏️', badge: 'bg-yellow-100 text-yellow-800' },
  'item:delete': { verb: 'Item deleted', emoji: '🗑️', badge: 'bg-red-100 text-red-800' },
  'mail:sent': { verb: 'Email sent', emoji: '✉️', badge: 'bg-indigo-100 text-indigo-800' },
  'auth:login': { verb: 'Logged in', emoji: '🔑', badge: 'bg-blue-100 text-blue-800' },
  'auth:logout': { verb: 'Signed out', emoji: '🚪', badge: 'bg-slate-100 text-slate-800' }
}

export default function ActivityItem({ activity }) {
  const [open, setOpen] = useState(false)

  // compute derived display values if backend didn't provide them
  const {
    verb,
    emoji,
    brief,
    itemName,
    expiryDate,
    details,
    createdAt,
    userName,
    type,
    message
  } = activity || {}

  const derived = useMemo(() => {
    const tmeta = TYPE_MAP[type] || {}
    const v = verb || tmeta.verb || (message ? message.split('\n')[0] : 'Activity')
    const e = emoji || tmeta.emoji || 'ℹ️'
    const name = itemName || (details && (details.item?.name || details.itemName)) || null
    const expiryIso = expiryDate || (details && (details.item?.expiryDate || details.expiryDate)) || null

    // brief fallback generation (simple, readable)
    let b = brief
    if (!b) {
      if (type === 'item:add' && name) b = `Added — ${name}${expiryIso ? ` · Expires ${fmtDate(expiryIso)}` : ''}`
      else if (type === 'item:update' && name) {
        if (details && Array.isArray(details.changes) && details.changes.length) {
          const small = details.changes.slice(0,3).map(c => `${c.field}:${c.from ?? ''}→${c.to ?? ''}`).join(', ')
          b = `Updated — ${name}${small ? ` · ${small}` : ''}`
        } else b = `Updated — ${name}`
      }
      else if (type === 'item:delete' && name) b = `Deleted — ${name}${expiryIso ? ` · Expired ${fmtDate(expiryIso)}` : ''}`
      else if (type === 'mail:sent') {
        const to = details && (details.to || (Array.isArray(details.recipients) && details.recipients.join(', '))) || ''
        b = message ? message : `Email sent${to ? ` — to ${to}` : ''}`
      } else if (type && v) {
        b = v
      } else {
        b = message || 'Activity'
      }
    }

    // badge color fallback
    const badge = (tmeta.badge) || 'bg-gray-100 text-gray-800'

    return { v, e, b, name, expiryIso, badge }
  }, [type, verb, emoji, brief, itemName, expiryDate, details, message])

  const badgeColor = derived.badge

  return (
    <div className="flex items-start gap-4 bg-white rounded-lg p-3 shadow-sm">
      <div className={`flex-none w-12 h-12 rounded-lg flex items-center justify-center ${badgeColor}`}>
        <div className="text-lg">{derived.e}</div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm">
              <span className="font-medium">{userName || 'System'}</span>
              <span className="text-gray-600"> — {derived.v}{derived.name ? ` — ${derived.name}` : ''}</span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {derived.b}
              {derived.expiryIso ? ` · Expires ${fmtDate(derived.expiryIso)}` : ''}
            </div>
          </div>
          <div className="text-xs text-gray-400">{timeAgo(createdAt)}</div>
        </div>

        { (details && Object.keys(details).length > 0) && (
          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <button
              onClick={() => setOpen(o => !o)}
              className="text-xs font-medium underline mr-2"
            >
              {open ? 'Hide details' : 'Show details'}
            </button>
            {open && <pre className="whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>}
          </div>
        )}
      </div>
    </div>
  )
}
