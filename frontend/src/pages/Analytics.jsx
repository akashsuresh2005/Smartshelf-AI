// // src/pages/Analytics.jsx - Dark Theme with Larger Fonts
// import { useEffect, useMemo, useState } from 'react'
// import { motion } from 'framer-motion'
// import { Bar, Doughnut } from 'react-chartjs-2'
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js'
// import api from '../utils/api.js'
// import { defaultOptions, categoryColors } from '../utils/charts.js'

// ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend)

// export default function Analytics() {
//   const [loading, setLoading] = useState(true)
//   const [data, setData] = useState({
//     categoryCounts: [],
//     statusCounts: { active: 0, expiringSoon: 0, expired: 0, consumed: 0 },
//     topHighValue: [],
//     topLowValue: [],
//     upcomingExpirations: []
//   })

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const { data } = await api.get('/analytics/dashboard')
//         setData(data)
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [])

//   const categories = useMemo(
//     () => ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'], []
//   )
//   const catMap = useMemo(() => {
//     const m = Object.fromEntries(categories.map(c => [c, 0]))
//     for (const row of data.categoryCounts || []) {
//       if (row.category && m[row.category] !== undefined) m[row.category] = row.count
//     }
//     return m
//   }, [data.categoryCounts, categories])

//   const barData = useMemo(() => ({
//     labels: categories.map(c => c[0].toUpperCase() + c.slice(1)),
//     datasets: [{
//       label: 'Items by Category',
//       data: categories.map(c => catMap[c]),
//       backgroundColor: categories.map(c => categoryColors[c])
//     }]
//   }), [categories, catMap])

//   const doughnutData = barData
//   const status = data.statusCounts || {}
//   const statusRows = [
//     { k: 'active',       label: 'Active',        color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60', icon: '✓' },
//     { k: 'expiringSoon', label: 'Expiring soon', color: 'bg-amber-900/40 text-amber-300 border-amber-800/60', icon: '⚠' },
//     { k: 'expired',      label: 'Expired',       color: 'bg-rose-900/40 text-rose-300 border-rose-800/60', icon: '✕' },
//     { k: 'consumed',     label: 'Consumed',      color: 'bg-blue-900/40 text-blue-300 border-blue-800/60', icon: '✔' }
//   ]

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-semibold text-cyan-400">Analytics</h1>
//         <button
//           className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 font-medium px-4 py-2.5 hover:bg-slate-700 transition-colors text-base flex items-center gap-2"
//           onClick={async () => {
//             setLoading(true)
//             const { data } = await api.get('/analytics/dashboard')
//             setData(data); setLoading(false)
//           }}
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//           </svg>
//           Refresh
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-slate-400 text-base py-8">Loading…</div>
//       ) : (
//         <>
//           {/* Charts */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <motion.div 
//               initial={{ opacity: 0, y: 10 }} 
//               animate={{ opacity: 1, y: 0 }} 
//               className="bg-slate-900/60 rounded-lg p-5 h-80 border border-slate-800/50"
//             >
//               <Bar data={barData} options={defaultOptions} />
//             </motion.div>
//             <motion.div 
//               initial={{ opacity: 0, y: 10 }} 
//               animate={{ opacity: 1, y: 0 }} 
//               className="bg-slate-900/60 rounded-lg p-5 h-80 border border-slate-800/50"
//             >
//               <Doughnut data={doughnutData} options={defaultOptions} />
//             </motion.div>
//           </div>

//           {/* Status cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
//             {statusRows.map(s => (
//               <motion.div 
//                 key={s.k} 
//                 initial={{ opacity: 0, scale: 0.95 }} 
//                 animate={{ opacity: 1, scale: 1 }}
//                 className={`rounded-lg p-5 border ${s.color} hover:scale-105 transition-transform duration-200`}
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm font-medium">{s.label}</p>
//                   <span className="text-2xl opacity-60">{s.icon}</span>
//                 </div>
//                 <p className="text-3xl font-bold">{status[s.k] ?? 0}</p>
//               </motion.div>
//             ))}
//           </div>

//           {/* Lists */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
//             <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
//               <div className="flex items-center gap-2 mb-4">
//                 <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                 </svg>
//                 <h3 className="font-semibold text-base text-slate-200">High value (Top 10)</h3>
//               </div>
//               <ul className="space-y-3 text-sm">
//                 {data.topHighValue.map(i => (
//                   <li key={i._id} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
//                     <span className="truncate text-slate-300">
//                       {i.name} <span className="text-slate-500">({i.category})</span>
//                     </span>
//                     <span className="font-semibold text-emerald-400">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
//                   </li>
//                 ))}
//                 {!data.topHighValue.length && <p className="text-slate-500 text-center py-4">No data</p>}
//               </ul>
//             </div>

//             <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
//               <div className="flex items-center gap-2 mb-4">
//                 <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
//                 </svg>
//                 <h3 className="font-semibold text-base text-slate-200">Low value (Top 10)</h3>
//               </div>
//               <ul className="space-y-3 text-sm">
//                 {data.topLowValue.map(i => (
//                   <li key={i._id} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
//                     <span className="truncate text-slate-300">
//                       {i.name} <span className="text-slate-500">({i.category})</span>
//                     </span>
//                     <span className="font-semibold text-blue-400">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
//                   </li>
//                 ))}
//                 {!data.topLowValue.length && <p className="text-slate-500 text-center py-4">No data</p>}
//               </ul>
//             </div>

//             <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
//               <div className="flex items-center gap-2 mb-4">
//                 <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <h3 className="font-semibold text-base text-slate-200">Upcoming expirations</h3>
//               </div>
//               <ul className="space-y-3 text-sm">
//                 {data.upcomingExpirations.map(i => (
//                   <li key={i._id} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
//                     <span className="truncate text-slate-300">
//                       {i.name} <span className="text-slate-500">({i.category})</span>
//                     </span>
//                     <span className="text-amber-400 font-medium">{new Date(i.expiryDate).toLocaleDateString()}</span>
//                   </li>
//                 ))}
//                 {!data.upcomingExpirations.length && <p className="text-slate-500 text-center py-4">No upcoming expirations</p>}
//               </ul>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }
// src/pages/Analytics.jsx - Dark Theme with Larger Fonts + added High/Low/Upcoming charts
// src/pages/Analytics.jsx - Analytics with graphs (15-day trend, stronger axes)
// src/pages/Analytics.jsx - Analytics with High/Low/Upcoming charts (15-day trend)
// Grid lines removed inside chart area; only X/Y axis borders shown.
// Status (Doughnut) enlarged.

// frontend/src/pages/Analytics.jsx
// Analytics page — final version per your latest requests:
// - Register Filler plugin
// - Enlarge all charts except the line chart
// - Remove internal grid lines, keep axis border lines
// - Add axis labels (x/y) to all charts that use axes
// - Enlarged status doughnut

// // frontend/src/pages/Analytics.jsx
// // Balanced analytics layout: toned-down sizes, improved alignment, axis labels kept.

// import { useEffect, useMemo, useState } from 'react'
// import { motion } from 'framer-motion'
// import { Bar, Doughnut, Line } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   ArcElement,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js'
// import api from '../utils/api.js'
// import { defaultOptions, categoryColors } from '../utils/charts.js'

// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   ArcElement,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
//   Filler
// )

// export default function Analytics() {
//   const [loading, setLoading] = useState(true)
//   const [data, setData] = useState({
//     categoryCounts: [],
//     statusCounts: { active: 0, expiringSoon: 0, expired: 0, consumed: 0 },
//     topHighValue: [],
//     topLowValue: [],
//     upcomingExpirations: [],
//     timeSeries: { byDay: [] }
//   })

//   const loadData = async () => {
//     setLoading(true)
//     try {
//       const { data } = await api.get('/analytics/dashboard')
//       setData(d => ({ ...d, ...data }))
//     } catch (err) {
//       console.error('Analytics load failed', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadData()
//   }, [])

//   const categories = useMemo(() => ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'], [])
//   const catMap = useMemo(() => {
//     const m = Object.fromEntries(categories.map(c => [c, 0]))
//     for (const row of data.categoryCounts || []) {
//       if (row && row.category && m[row.category] !== undefined) m[row.category] = Number(row.count || 0)
//     }
//     return m
//   }, [data.categoryCounts, categories])

//   const barData = useMemo(() => ({
//     labels: categories.map(c => c[0].toUpperCase() + c.slice(1)),
//     datasets: [{
//       label: 'Items by Category',
//       data: categories.map(c => catMap[c] || 0),
//       backgroundColor: categories.map(c => categoryColors[c] || '#6b7280'),
//       borderRadius: 6
//     }]
//   }), [categories, catMap])

//   const status = data.statusCounts || {}
//   const doughnutData = useMemo(() => ({
//     labels: ['Active', 'Expiring soon', 'Expired', 'Consumed'],
//     datasets: [{
//       data: [Number(status.active || 0), Number(status.expiringSoon || 0), Number(status.expired || 0), Number(status.consumed || 0)],
//       backgroundColor: ['#06b6d4', '#f59e0b', '#ef476f', '#3b82f6'],
//       hoverOffset: 6
//     }]
//   }), [status])

//   const ts = data.timeSeries?.byDay || []
//   const lineLabels = ts.map(d => d.date)
//   const lineAdded = ts.map(d => Number(d.added || 0))
//   const lineExpiring = ts.map(d => Number(d.expiring || 0))

//   const lineData = useMemo(() => ({
//     labels: lineLabels,
//     datasets: [
//       {
//         label: 'Added',
//         data: lineAdded,
//         borderColor: '#06b6d4',
//         backgroundColor: 'rgba(6,182,212,0.06)',
//         tension: 0.25,
//         fill: true,
//         pointRadius: 2,
//         borderWidth: 2
//       },
//       {
//         label: 'Expiring',
//         data: lineExpiring,
//         borderColor: '#f59e0b',
//         backgroundColor: 'rgba(245,158,11,0.06)',
//         tension: 0.25,
//         fill: true,
//         pointRadius: 2,
//         borderWidth: 2
//       }
//     ]
//   }), [lineLabels, lineAdded, lineExpiring])

//   const prepareHorizontalBar = (items = [], valueKey = 'estimatedCost') => {
//     const labels = items.map(i => (i.name || '—').slice(0, 30))
//     const values = items.map(i => Number(i[valueKey] || 0))
//     return {
//       labels,
//       datasets: [{
//         label: '',
//         data: values,
//         backgroundColor: 'rgba(6,182,212,0.18)',
//         borderColor: '#06b6d4',
//         borderWidth: 1,
//         borderRadius: 6
//       }]
//     }
//   }

//   const highBarData = useMemo(() => prepareHorizontalBar(data.topHighValue || []), [data.topHighValue])
//   const lowBarData = useMemo(() => prepareHorizontalBar(data.topLowValue || []), [data.topLowValue])

//   const upcomingByDate = useMemo(() => {
//     const map = {}
//     for (const it of data.upcomingExpirations || []) {
//       const d = it.expiryDate ? new Date(it.expiryDate).toISOString().slice(0, 10) : 'unknown'
//       map[d] = (map[d] || 0) + 1
//     }
//     const keys = Object.keys(map).sort()
//     return {
//       labels: keys,
//       datasets: [{
//         label: 'Expirations',
//         data: keys.map(k => map[k]),
//         backgroundColor: '#f59e0b',
//         borderRadius: 6
//       }]
//     }
//   }, [data.upcomingExpirations])

//   // Styling: no internal grid lines, only axis borders; axis labels included
//   const axisBorderColor = 'rgba(148,163,184,0.85)'
//   const axisTickColor = '#9fb8d8'
//   const axisTitleColor = '#cbd5e1'

//   // Horizontal (value on X) options for horizontal bars (High/Low)
//   const horizontalOptions = {
//     indexAxis: 'y',
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//       tooltip: { mode: 'nearest', intersect: false }
//     },
//     scales: {
//       x: {
//         ticks: { color: axisTickColor },
//         grid: { display: false },
//         border: { color: axisBorderColor, width: 1 },
//         title: { display: true, text: 'Value (₹)', color: axisTitleColor, font: { size: 12 } }
//       },
//       y: {
//         ticks: { color: '#cbd5e1' },
//         grid: { display: false },
//         border: { color: axisBorderColor, width: 1 },
//         title: { display: false }
//       }
//     }
//   }

//   // Small options used by small vertical bar
//   const smallOptions = {
//     maintainAspectRatio: false,
//     plugins: { legend: { display: false } },
//     scales: {
//       x: { ticks: { color: axisTickColor }, grid: { display: false }, border: { color: axisBorderColor, width: 1 }, title: { display: true, text: 'Date', color: axisTitleColor, font: { size: 12 } } },
//       y: { ticks: { color: axisTickColor }, grid: { display: false }, border: { color: axisBorderColor, width: 1 }, title: { display: true, text: 'Count', color: axisTitleColor, font: { size: 12 } } }
//     }
//   }

//   // Primary options (category bar & line base)
//   const primaryOptions = {
//     ...defaultOptions,
//     plugins: { ...defaultOptions.plugins, legend: { position: 'bottom', labels: { color: '#cbd5e1' } } },
//     scales: {
//       x: {
//         ticks: { color: axisTickColor },
//         grid: { display: false },
//         border: { color: axisBorderColor, width: 1 },
//         title: { display: true, text: 'Category', color: axisTitleColor, font: { size: 12 } }
//       },
//       y: {
//         ticks: { color: axisTickColor, beginAtZero: true },
//         grid: { display: false },
//         border: { color: axisBorderColor, width: 1 },
//         title: { display: true, text: 'Count', color: axisTitleColor, font: { size: 12 } }
//       }
//     }
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-semibold text-cyan-400">Analytics</h1>

//         <button
//           className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 font-medium px-4 py-2.5 hover:bg-slate-700 transition-colors text-base flex items-center gap-2"
//           onClick={async () => { await loadData() }}
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//           </svg>
//           Refresh
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-slate-400 text-base py-8">Loading…</div>
//       ) : (
//         <>
//           {/* Primary graphs: Line + status + category */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
//             <motion.div
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="lg:col-span-2 bg-slate-900/60 rounded-lg p-5 h-[26rem] border border-slate-800/50"
//             >
//               <h3 className="font-semibold text-slate-200 mb-3">Inventory trend (last 15 days)</h3>
//               <div className="h-[calc(100%-40px)]">
//                 <Line
//                   data={lineData}
//                   options={{
//                     ...primaryOptions,
//                     plugins: { ...primaryOptions.plugins, legend: { position: 'bottom', labels: { color: '#cbd5e1' } } }
//                   }}
//                 />
//               </div>
//             </motion.div>

//             <div className="space-y-5">
//               <motion.div
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-slate-900/60 rounded-lg p-5 h-56 border border-slate-800/50 flex flex-col items-center justify-center"
//               >
//                 <h3 className="font-semibold text-slate-200 mb-2">Status overview</h3>
//                 <div className="w-48 h-48">
//                   <Doughnut
//                     data={doughnutData}
//                     options={{
//                       maintainAspectRatio: false,
//                       plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1' } } }
//                     }}
//                   />
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-slate-900/60 rounded-lg p-4 h-64 border border-slate-800/50"
//               >
//                 <h3 className="font-semibold text-slate-200 mb-2">Items by Category</h3>
//                 <div className="h-[calc(100%-36px)]">
//                   <Bar
//                     data={barData}
//                     options={{
//                       ...primaryOptions,
//                       plugins: { ...primaryOptions.plugins, legend: { display: false } }
//                     }}
//                   />
//                 </div>
//               </motion.div>
//             </div>
//           </div>

//           {/* Charts for lists — moderate sizes */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
//             <motion.div className="bg-slate-900/60 rounded-lg p-5 h-[20rem] border border-slate-800/50" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
//               <h3 className="font-semibold text-slate-200 mb-3">High value (Top 10)</h3>
//               <div className="h-[calc(100%-36px)]">
//                 <Bar data={highBarData} options={{
//                   ...horizontalOptions,
//                   plugins: {
//                     ...horizontalOptions.plugins,
//                     tooltip: { callbacks: { label: ctx => `₹${Number(ctx.raw || 0).toFixed(2)}` } }
//                   }
//                 }} />
//               </div>
//             </motion.div>

//             <motion.div className="bg-slate-900/60 rounded-lg p-5 h-[20rem] border border-slate-800/50" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
//               <h3 className="font-semibold text-slate-200 mb-3">Low value (Top 10)</h3>
//               <div className="h-[calc(100%-36px)]">
//                 <Bar data={lowBarData} options={{
//                   ...horizontalOptions,
//                   plugins: {
//                     ...horizontalOptions.plugins,
//                     tooltip: { callbacks: { label: ctx => `₹${Number(ctx.raw || 0).toFixed(2)}` } }
//                   }
//                 }} />
//               </div>
//             </motion.div>

//             <motion.div className="bg-slate-900/60 rounded-lg p-5 h-[20rem] border border-slate-800/50" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
//               <h3 className="font-semibold text-slate-200 mb-3">Upcoming expirations (by date)</h3>
//               <div className="h-[calc(100%-36px)]">
//                 <Bar data={upcomingByDate} options={{
//                   ...smallOptions,
//                   plugins: {
//                     ...smallOptions.plugins,
//                     tooltip: { callbacks: { label: ctx => `${ctx.raw} item(s)` } }
//                   }
//                 }} />
//               </div>
//             </motion.div>
//           </div>

//           {/* Status cards & lists (unchanged) */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
//             {[
//               { k: 'active',       label: 'Active',        color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60', icon: '✓' },
//               { k: 'expiringSoon', label: 'Expiring soon', color: 'bg-amber-900/40 text-amber-300 border-amber-800/60', icon: '⚠' },
//               { k: 'expired',      label: 'Expired',       color: 'bg-rose-900/40 text-rose-300 border-rose-800/60', icon: '✕' },
//               { k: 'consumed',     label: 'Consumed',      color: 'bg-blue-900/40 text-blue-300 border-blue-800/60', icon: '✔' }
//             ].map(s => (
//               <motion.div key={s.k} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-lg p-5 border ${s.color} hover:scale-105 transition-transform duration-200`}>
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm font-medium">{s.label}</p>
//                   <span className="text-2xl opacity-60">{s.icon}</span>
//                 </div>
//                 <p className="text-3xl font-bold">{(data.statusCounts && data.statusCounts[s.k]) ?? 0}</p>
//               </motion.div>
//             ))}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
//             <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
//               <div className="flex items-center gap-2 mb-4">
//                 <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                 </svg>
//                 <h3 className="font-semibold text-base text-slate-200">High value (Top 10)</h3>
//               </div>
//               <ul className="space-y-3 text-sm">
//                 {data.topHighValue.map((i, idx) => (
//                   <li key={i._id ?? idx} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
//                     <span className="truncate text-slate-300">{i.name} <span className="text-slate-500">({i.category})</span></span>
//                     <span className="font-semibold text-emerald-400">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
//                   </li>
//                 ))}
//                 {!data.topHighValue.length && <p className="text-slate-500 text-center py-4">No data</p>}
//               </ul>
//             </div>

//             <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
//               <div className="flex items-center gap-2 mb-4">
//                 <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
//                 </svg>
//                 <h3 className="font-semibold text-base text-slate-200">Low value (Top 10)</h3>
//               </div>
//               <ul className="space-y-3 text-sm">
//                 {data.topLowValue.map((i, idx) => (
//                   <li key={i._id ?? idx} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
//                     <span className="truncate text-slate-300">{i.name} <span className="text-slate-500">({i.category})</span></span>
//                     <span className="font-semibold text-blue-400">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
//                   </li>
//                 ))}
//                 {!data.topLowValue.length && <p className="text-slate-500 text-center py-4">No data</p>}
//               </ul>
//             </div>

//             <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
//               <div className="flex items-center gap-2 mb-4">
//                 <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <h3 className="font-semibold text-base text-slate-200">Upcoming expirations</h3>
//               </div>
//               <ul className="space-y-3 text-sm">
//                 {data.upcomingExpirations.map((i, idx) => (
//                   <li key={i._id ?? idx} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
//                     <span className="truncate text-slate-300">{i.name} <span className="text-slate-500">({i.category})</span></span>
//                     <span className="text-amber-400 font-medium">{new Date(i.expiryDate).toLocaleDateString()}</span>
//                   </li>
//                 ))}
//                 {!data.upcomingExpirations.length && <p className="text-slate-500 text-center py-4">No upcoming expirations</p>}
//               </ul>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }



// frontend/src/pages/Analytics.jsx
// Balanced analytics layout: toned-down sizes, improved alignment, axis labels kept.

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import api from '../utils/api.js'
import { defaultOptions, categoryColors } from '../utils/charts.js'

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

/** Helper: normalize various possible backend shapes */
function ensureArray(v) {
  return Array.isArray(v) ? v : []
}
function ensureObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
}

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    categoryCounts: [],
    statusCounts: { active: 0, expiringSoon: 0, expired: 0, consumed: 0 },
    topHighValue: [],
    topLowValue: [],
    upcomingExpirations: [],
    timeSeries: { byDay: [] }
  })

  const loadData = async () => {
    setLoading(true)
    try {
      // api.get returns res.data directly (not axios response)
      const resp = await api.get('/analytics/dashboard')
      // debug: log raw response so you can verify shape in console
      console.debug('[analytics] raw response:', resp)

      const payload = resp ?? {}

      // Normalize fields safely:
      const categoryCounts = ensureArray(payload.categoryCounts ?? payload.categories ?? payload.byCategory)
      const statusCounts = ensureObject(payload.statusCounts ?? payload.status ?? {})
      const topHighValue = ensureArray(payload.topHighValue ?? payload.highValue ?? payload.topHigh)
      const topLowValue = ensureArray(payload.topLowValue ?? payload.lowValue ?? payload.topLow)
      const upcomingExpirations = ensureArray(payload.upcomingExpirations ?? payload.upcoming ?? payload.expirations ?? [])
      // timeSeries may be { byDay: [] } or { byDay: [{date, added, expiring}]} or payload.byDay as array
      const timeSeriesRaw = payload.timeSeries ?? {}
      const timeSeriesByDay = ensureArray(timeSeriesRaw.byDay ?? payload.byDay ?? payload.trend ?? [])

      const normalized = {
        categoryCounts,
        statusCounts,
        topHighValue,
        topLowValue,
        upcomingExpirations,
        timeSeries: { byDay: timeSeriesByDay }
      }

      setData((d) => ({ ...d, ...normalized }))
    } catch (err) {
      console.error('Analytics load failed', err)
      // keep previous data but stop loading
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const categories = useMemo(() => ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'], [])
  const catMap = useMemo(() => {
    const m = Object.fromEntries(categories.map(c => [c, 0]))
    for (const row of data.categoryCounts || []) {
      if (row && row.category && m[row.category] !== undefined) m[row.category] = Number(row.count || 0)
    }
    return m
  }, [data.categoryCounts, categories])

  const barData = useMemo(() => ({
    labels: categories.map(c => c[0].toUpperCase() + c.slice(1)),
    datasets: [{
      label: 'Items by Category',
      data: categories.map(c => catMap[c] || 0),
      backgroundColor: categories.map(c => categoryColors[c] || '#6b7280'),
      borderRadius: 6
    }]
  }), [categories, catMap])

  const status = data.statusCounts || {}
  const doughnutData = useMemo(() => ({
    labels: ['Active', 'Expiring soon', 'Expired', 'Consumed'],
    datasets: [{
      data: [Number(status.active || 0), Number(status.expiringSoon || 0), Number(status.expired || 0), Number(status.consumed || 0)],
      backgroundColor: ['#06b6d4', '#f59e0b', '#ef476f', '#3b82f6'],
      hoverOffset: 6
    }]
  }), [status])

  const ts = (data.timeSeries && Array.isArray(data.timeSeries.byDay)) ? data.timeSeries.byDay : []
  const lineLabels = ts.map(d => d.date)
  const lineAdded = ts.map(d => Number(d.added || 0))
  const lineExpiring = ts.map(d => Number(d.expiring || 0))

  const lineData = useMemo(() => ({
    labels: lineLabels,
    datasets: [
      {
        label: 'Added',
        data: lineAdded,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.06)',
        tension: 0.25,
        fill: true,
        pointRadius: 2,
        borderWidth: 2
      },
      {
        label: 'Expiring',
        data: lineExpiring,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.06)',
        tension: 0.25,
        fill: true,
        pointRadius: 2,
        borderWidth: 2
      }
    ]
  }), [lineLabels, lineAdded, lineExpiring])

  const prepareHorizontalBar = (items = [], valueKey = 'estimatedCost') => {
    const labels = items.map(i => (i.name || '—').slice(0, 30))
    const values = items.map(i => Number(i[valueKey] || 0))
    return {
      labels,
      datasets: [{
        label: '',
        data: values,
        backgroundColor: 'rgba(6,182,212,0.18)',
        borderColor: '#06b6d4',
        borderWidth: 1,
        borderRadius: 6
      }]
    }
  }

  const highBarData = useMemo(() => prepareHorizontalBar(data.topHighValue || []), [data.topHighValue])
  const lowBarData = useMemo(() => prepareHorizontalBar(data.topLowValue || []), [data.topLowValue])

  const upcomingByDate = useMemo(() => {
    const map = {}
    for (const it of data.upcomingExpirations || []) {
      const d = it?.expiryDate ? new Date(it.expiryDate).toISOString().slice(0, 10) : 'unknown'
      map[d] = (map[d] || 0) + 1
    }
    const keys = Object.keys(map).sort()
    return {
      labels: keys,
      datasets: [{
        label: 'Expirations',
        data: keys.map(k => map[k]),
        backgroundColor: '#f59e0b',
        borderRadius: 6
      }]
    }
  }, [data.upcomingExpirations])

  // Styling: no internal grid lines, only axis borders; axis labels included
  const axisBorderColor = 'rgba(148,163,184,0.85)'
  const axisTickColor = '#9fb8d8'
  const axisTitleColor = '#cbd5e1'

  // Horizontal (value on X) options for horizontal bars (High/Low)
  const horizontalOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'nearest', intersect: false }
    },
    scales: {
      x: {
        ticks: { color: axisTickColor },
        grid: { display: false },
        border: { color: axisBorderColor, width: 1 },
        title: { display: true, text: 'Value (₹)', color: axisTitleColor, font: { size: 12 } }
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { display: false },
        border: { color: axisBorderColor, width: 1 },
        title: { display: false }
      }
    }
  }

  // Small options used by small vertical bar
  const smallOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: axisTickColor }, grid: { display: false }, border: { color: axisBorderColor, width: 1 }, title: { display: true, text: 'Date', color: axisTitleColor, font: { size: 12 } } },
      y: { ticks: { color: axisTickColor }, grid: { display: false }, border: { color: axisBorderColor, width: 1 }, title: { display: true, text: 'Count', color: axisTitleColor, font: { size: 12 } } }
    }
  }

  // Primary options (category bar & line base)
  const primaryOptions = {
    ...defaultOptions,
    plugins: { ...defaultOptions.plugins, legend: { position: 'bottom', labels: { color: '#cbd5e1' } } },
    scales: {
      x: {
        ticks: { color: axisTickColor },
        grid: { display: false },
        border: { color: axisBorderColor, width: 1 },
        title: { display: true, text: 'Category', color: axisTitleColor, font: { size: 12 } }
      },
      y: {
        ticks: { color: axisTickColor, beginAtZero: true },
        grid: { display: false },
        border: { color: axisBorderColor, width: 1 },
        title: { display: true, text: 'Count', color: axisTitleColor, font: { size: 12 } }
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-cyan-400">Analytics</h1>

        <button
          className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 font-medium px-4 py-2.5 hover:bg-slate-700 transition-colors text-base flex items-center gap-2"
          onClick={async () => { await loadData() }}
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
          {/* Primary graphs: Line + status + category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-slate-900/60 rounded-lg p-5 h-[26rem] border border-slate-800/50"
            >
              <h3 className="font-semibold text-slate-200 mb-3">Inventory trend (last 15 days)</h3>
              <div className="h-[calc(100%-40px)]">
                <Line
                  data={lineData}
                  options={{
                    ...primaryOptions,
                    plugins: { ...primaryOptions.plugins, legend: { position: 'bottom', labels: { color: '#cbd5e1' } } }
                  }}
                />
              </div>
            </motion.div>

            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 rounded-lg p-5 h-56 border border-slate-800/50 flex flex-col items-center justify-center"
              >
                <h3 className="font-semibold text-slate-200 mb-2">Status overview</h3>
                <div className="w-48 h-48">
                  <Doughnut
                    data={doughnutData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1' } } }
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 rounded-lg p-4 h-64 border border-slate-800/50"
              >
                <h3 className="font-semibold text-slate-200 mb-2">Items by Category</h3>
                <div className="h-[calc(100%-36px)]">
                  <Bar
                    data={barData}
                    options={{
                      ...primaryOptions,
                      plugins: { ...primaryOptions.plugins, legend: { display: false } }
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Charts for lists — moderate sizes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <motion.div className="bg-slate-900/60 rounded-lg p-5 h-[20rem] border border-slate-800/50" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-semibold text-slate-200 mb-3">High value (Top 10)</h3>
              <div className="h-[calc(100%-36px)]">
                <Bar data={highBarData} options={{
                  ...horizontalOptions,
                  plugins: {
                    ...horizontalOptions.plugins,
                    tooltip: { callbacks: { label: ctx => `₹${Number(ctx.raw || 0).toFixed(2)}` } }
                  }
                }} />
              </div>
            </motion.div>

            <motion.div className="bg-slate-900/60 rounded-lg p-5 h-[20rem] border border-slate-800/50" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-semibold text-slate-200 mb-3">Low value (Top 10)</h3>
              <div className="h-[calc(100%-36px)]">
                <Bar data={lowBarData} options={{
                  ...horizontalOptions,
                  plugins: {
                    ...horizontalOptions.plugins,
                    tooltip: { callbacks: { label: ctx => `₹${Number(ctx.raw || 0).toFixed(2)}` } }
                  }
                }} />
              </div>
            </motion.div>

            <motion.div className="bg-slate-900/60 rounded-lg p-5 h-[20rem] border border-slate-800/50" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-semibold text-slate-200 mb-3">Upcoming expirations (by date)</h3>
              <div className="h-[calc(100%-36px)]">
                <Bar data={upcomingByDate} options={{
                  ...smallOptions,
                  plugins: {
                    ...smallOptions.plugins,
                    tooltip: { callbacks: { label: ctx => `${ctx.raw} item(s)` } }
                  }
                }} />
              </div>
            </motion.div>
          </div>

          {/* Status cards & lists (unchanged) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[
              { k: 'active',       label: 'Active',        color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60', icon: '✓' },
              { k: 'expiringSoon', label: 'Expiring soon', color: 'bg-amber-900/40 text-amber-300 border-amber-800/60', icon: '⚠' },
              { k: 'expired',      label: 'Expired',       color: 'bg-rose-900/40 text-rose-300 border-rose-800/60', icon: '✕' },
              { k: 'consumed',     label: 'Consumed',      color: 'bg-blue-900/40 text-blue-300 border-blue-800/60', icon: '✔' }
            ].map(s => (
              <motion.div key={s.k} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-lg p-5 border ${s.color} hover:scale-105 transition-transform duration-200`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{s.label}</p>
                  <span className="text-2xl opacity-60">{s.icon}</span>
                </div>
                <p className="text-3xl font-bold">{(data.statusCounts && data.statusCounts[s.k]) ?? 0}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="font-semibold text-base text-slate-200">High value (Top 10)</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {data.topHighValue.map((i, idx) => (
                  <li key={i._id ?? idx} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <span className="truncate text-slate-300">{i.name} <span className="text-slate-500">({i.category})</span></span>
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
                {data.topLowValue.map((i, idx) => (
                  <li key={i._id ?? idx} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <span className="truncate text-slate-300">{i.name} <span className="text-slate-500">({i.category})</span></span>
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
                {data.upcomingExpirations.map((i, idx) => (
                  <li key={i._id ?? idx} className="flex items-center justify-between p-2 rounded bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <span className="truncate text-slate-300">{i.name} <span className="text-slate-500">({i.category})</span></span>
                    <span className="text-amber-400 font-medium">{i.expiryDate ? new Date(i.expiryDate).toLocaleDateString() : '—'}</span>
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
