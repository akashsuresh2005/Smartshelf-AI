// src/pages/ActivityLog.jsx
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import ActivityItem from '../components/ActivityItem.jsx' // new component we add
import ReportModal from '../components/ReportModal.jsx'   // <-- added

const TYPE_MAP = {
  'item:add': { label: 'Item added', emoji: '➕', color: 'bg-green-50 text-green-700' },
  'item:update': { label: 'Item updated', emoji: '✏️', color: 'bg-yellow-50 text-yellow-800' },
  'item:delete': { label: 'Item deleted', emoji: '🗑️', color: 'bg-red-50 text-red-700' },
  'auth:login': { label: 'User signed in', emoji: '🔑', color: 'bg-blue-50 text-blue-700' },
  'auth:logout': { label: 'User signed out', emoji: '↩️', color: 'bg-slate-50 text-slate-700' },
  'mail:sent': { label: 'Email sent', emoji: '✉️', color: 'bg-indigo-50 text-indigo-700' },
  'auth:signup': { label: 'New user', emoji: '🎉', color: 'bg-purple-50 text-purple-700' }
}

function getTypeMeta(type) {
  return TYPE_MAP[type] || { label: type || 'other', emoji: 'ℹ️', color: 'bg-gray-100 text-gray-800' }
}

function formatWhen(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString()
}

export default function ActivityLog() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [perPage, setPerPage] = useState(20)

  // NEW: report modal open state (non-invasive)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/activity?limit=200')
        if (!mounted) return
        // server returns array of activities (listActivities returns items array)
        setActivities(Array.isArray(data) ? data : (data.activities || []))
      } catch (err) {
        console.error('Failed to load activity', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const types = useMemo(() => {
    const s = new Set(activities.map(a => a.type).filter(Boolean))
    return ['all', ...Array.from(s).sort()]
  }, [activities])

  const filtered = useMemo(() => {
    if (filterType === 'all') return activities.slice(0, perPage)
    return activities.filter(a => a.type === filterType).slice(0, perPage)
  }, [activities, filterType, perPage])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Activity log</h1>
          <p className="text-sm text-gray-500">Recent actions & system events</p>
        </div>
        <div className="text-sm text-gray-600 hidden sm:block">Signed in as <span className="font-medium">{user?.name || user?.email}</span></div>
      </div>

      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">Activity type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full rounded-lg border-gray-200 px-3 py-2">
              {types.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'All Activities' : t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Items per page</label>
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="w-full rounded-lg border-gray-200 px-3 py-2">
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="hidden md:flex items-end justify-end text-sm text-gray-500 gap-3">
            <span>{activities.length} total</span>

            {/* NEW: Generate report button (non-invasive) */}
            <button
              className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
              onClick={() => setReportOpen(true)}
            >
              Generate report
            </button>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">No activities yet.</div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((a) => (
              <motion.li
                key={a._id || a.id || Math.random()}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <ActivityItem activity={a} />
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* NEW: Report modal — exports the currently visible (filtered) activities */}
      {reportOpen && (
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          activities={filtered} // pass filtered so export matches current view
        />
      )}
    </div>
  )
}
