// src/pages/Analytics.jsx - Dark Theme with Larger Fonts
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js'
import api from '../utils/api.js'
import { defaultOptions, categoryColors } from '../utils/charts.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend)

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    categoryCounts: [],
    statusCounts: { active: 0, expiringSoon: 0, expired: 0, consumed: 0 },
    topHighValue: [],
    topLowValue: [],
    upcomingExpirations: []
  })

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/analytics/dashboard')
        setData(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = useMemo(
    () => ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'], []
  )
  const catMap = useMemo(() => {
    const m = Object.fromEntries(categories.map(c => [c, 0]))
    for (const row of data.categoryCounts || []) {
      if (row.category && m[row.category] !== undefined) m[row.category] = row.count
    }
    return m
  }, [data.categoryCounts, categories])

  const barData = useMemo(() => ({
    labels: categories.map(c => c[0].toUpperCase() + c.slice(1)),
    datasets: [{
      label: 'Items by Category',
      data: categories.map(c => catMap[c]),
      backgroundColor: categories.map(c => categoryColors[c])
    }]
  }), [categories, catMap])

  const doughnutData = barData
  const status = data.statusCounts || {}
  const statusRows = [
    { k: 'active',       label: 'Active',        color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60', icon: '✓' },
    { k: 'expiringSoon', label: 'Expiring soon', color: 'bg-amber-900/40 text-amber-300 border-amber-800/60', icon: '⚠' },
    { k: 'expired',      label: 'Expired',       color: 'bg-rose-900/40 text-rose-300 border-rose-800/60', icon: '✕' },
    { k: 'consumed',     label: 'Consumed',      color: 'bg-blue-900/40 text-blue-300 border-blue-800/60', icon: '✔' }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-cyan-400">Analytics</h1>
        <button
          className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 font-medium px-4 py-2.5 hover:bg-slate-700 transition-colors text-base flex items-center gap-2"
          onClick={async () => {
            setLoading(true)
            const { data } = await api.get('/analytics/dashboard')
            setData(data); setLoading(false)
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-base py-8">Loading…</div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-slate-900/60 rounded-lg p-5 h-80 border border-slate-800/50"
            >
              <Bar data={barData} options={defaultOptions} />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-slate-900/60 rounded-lg p-5 h-80 border border-slate-800/50"
            >
              <Doughnut data={doughnutData} options={defaultOptions} />
            </motion.div>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {statusRows.map(s => (
              <motion.div 
                key={s.k} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-lg p-5 border ${s.color} hover:scale-105 transition-transform duration-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{s.label}</p>
                  <span className="text-2xl opacity-60">{s.icon}</span>
                </div>
                <p className="text-3xl font-bold">{status[s.k] ?? 0}</p>
              </motion.div>
            ))}
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="font-semibold text-base text-slate-200">High value (Top 10)</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {data.topHighValue.map(i => (
                  <li key={i._id} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <span className="truncate text-slate-300">
                      {i.name} <span className="text-slate-500">({i.category})</span>
                    </span>
                    <span className="font-semibold text-emerald-400">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
                  </li>
                ))}
                {!data.topHighValue.length && <p className="text-slate-500 text-center py-4">No data</p>}
              </ul>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <h3 className="font-semibold text-base text-slate-200">Low value (Top 10)</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {data.topLowValue.map(i => (
                  <li key={i._id} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <span className="truncate text-slate-300">
                      {i.name} <span className="text-slate-500">({i.category})</span>
                    </span>
                    <span className="font-semibold text-blue-400">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
                  </li>
                ))}
                {!data.topLowValue.length && <p className="text-slate-500 text-center py-4">No data</p>}
              </ul>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-base text-slate-200">Upcoming expirations</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {data.upcomingExpirations.map(i => (
                  <li key={i._id} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <span className="truncate text-slate-300">
                      {i.name} <span className="text-slate-500">({i.category})</span>
                    </span>
                    <span className="text-amber-400 font-medium">{new Date(i.expiryDate).toLocaleDateString()}</span>
                  </li>
                ))}
                {!data.upcomingExpirations.length && <p className="text-slate-500 text-center py-4">No upcoming expirations</p>}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}