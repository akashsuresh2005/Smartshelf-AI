// ActivityItem.jsx - Dark Theme with Larger Fonts & Better Icons
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

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

// Updated icons with SVG for better quality
const TYPE_MAP = {
  'item:add': { 
    verb: 'New item added', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    badge: 'bg-teal-900/40 text-teal-300 border-teal-800/60' 
  },
  'item:update': { 
    verb: 'Item updated', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    badge: 'bg-amber-900/40 text-amber-300 border-amber-800/60' 
  },
  'item:delete': { 
    verb: 'Item deleted', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    badge: 'bg-rose-900/40 text-rose-300 border-rose-800/60' 
  },
  'mail:sent': { 
    verb: 'Email sent', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: 'bg-indigo-900/40 text-indigo-300 border-indigo-800/60' 
  },
  'auth:login': { 
    verb: 'Logged in', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
    ),
    badge: 'bg-blue-900/40 text-blue-300 border-blue-800/60' 
  },
  'auth:logout': { 
    verb: 'Signed out', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    badge: 'bg-slate-700/40 text-slate-300 border-slate-600/60' 
  }
}

export default function ActivityItem({ activity }) {
  const [open, setOpen] = useState(false)

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
    const defaultIcon = (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    const icon = tmeta.icon || defaultIcon
    const name = itemName || (details && (details.item?.name || details.itemName)) || null
    const expiryIso = expiryDate || (details && (details.item?.expiryDate || details.expiryDate)) || null

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

    const badge = (tmeta.badge) || 'bg-gray-700/40 text-gray-300 border-gray-600/60'

    return { v, icon, b, name, expiryIso, badge }
  }, [type, verb, emoji, brief, itemName, expiryDate, details, message])

  const badgeColor = derived.badge

  return (
    <div className="group flex items-start gap-4 bg-slate-800/60 rounded-lg p-4 border border-slate-700/40 hover:bg-slate-700/60 hover:border-slate-600/50 transition-all duration-200">
      <div className={`flex-none w-14 h-14 rounded-lg flex items-center justify-center border ${badgeColor} transition-transform duration-200 group-hover:scale-105`}>
        {derived.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-base">
              <span className="font-semibold text-slate-200">{userName || 'System'}</span>
              <span className="text-slate-400"> — {derived.v}</span>
              {derived.name && <span className="text-slate-300"> — {derived.name}</span>}
            </div>
            <div className="mt-1.5 text-sm text-slate-500">
              {derived.b}
              {derived.expiryIso && <span className="text-amber-400"> · Expires {fmtDate(derived.expiryIso)}</span>}
            </div>
          </div>
          <div className="flex-none text-sm text-slate-500 font-medium">{timeAgo(createdAt)}</div>
        </div>

        {(details && Object.keys(details).length > 0) && (
          <div className="mt-3 text-sm text-slate-400 bg-slate-900/40 border border-slate-700/40 p-3 rounded">
            <button
              onClick={() => setOpen(o => !o)}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 underline mr-2 transition-colors"
            >
              {open ? 'Hide details' : 'Show details'}
            </button>
            {open && <pre className="whitespace-pre-wrap mt-2 text-slate-400 text-xs">{JSON.stringify(details, null, 2)}</pre>}
          </div>
        )}
      </div>
    </div>
  )
}