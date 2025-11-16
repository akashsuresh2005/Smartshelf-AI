// src/pages/ActivityLog.jsx - Dark Theme with Larger Fonts
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import ActivityItem from '../components/ActivityItem.jsx'
import ReportModal from '../components/ReportModal.jsx'

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
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/activity?limit=200')
        if (!mounted) return
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
    <div className="bg-slate-950 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-cyan-400">Activity log</h1>
          <p className="text-base text-slate-500 mt-1">Recent actions & system events</p>
        </div>
        <div className="text-base text-slate-400 hidden sm:block">
          Signed in as <span className="font-medium text-slate-300">{user?.name || user?.email}</span>
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-lg p-5 mb-4 border border-slate-800/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-500 mb-2 block">Activity type</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)} 
              className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              {types.map(t => (
                <option key={t} value={t} className="bg-slate-800">{t === 'all' ? 'All Activities' : t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500 mb-2 block">Items per page</label>
            <select 
              value={perPage} 
              onChange={(e) => setPerPage(Number(e.target.value))} 
              className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              {[10,20,50,100].map(n => <option key={n} value={n} className="bg-slate-800">{n}</option>)}
            </select>
          </div>

          <div className="hidden md:flex items-end justify-end text-base text-slate-400 gap-3">
            <span className="text-cyan-400 font-semibold text-lg">{activities.length}</span>
            <span>total</span>

            <button
              className="text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-colors"
              onClick={() => setReportOpen(true)}
            >
              Generate report
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50"
      >
        {loading ? (
          <div className="text-slate-500 text-base py-8">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-slate-500 text-base py-8">No activities yet.</div>
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

      {reportOpen && (
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          activities={filtered}
        />
      )}
    </div>
  )
}