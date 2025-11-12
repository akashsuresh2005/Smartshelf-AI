// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import { Bar, Doughnut } from 'react-chartjs-2'
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js'
// import api from '../utils/api.js'
// import { defaultOptions, categoryColors } from '../utils/charts.js'

// ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend)

// export default function Analytics() {
//   const [items, setItems] = useState([])

//   useEffect(() => {
//     api.get('/api/items').then(({ data }) => setItems(data || []))
//   }, [])

//   const categories = ['groceries', 'medicines', 'cosmetics', 'beverages', 'others']
//   const counts = categories.map((c) => items.filter((i) => i.category === c).length)

//   const barData = {
//     labels: categories,
//     datasets: [
//       {
//         label: 'Items by Category',
//         data: counts,
//         backgroundColor: categories.map((c) => categoryColors[c])
//       }
//     ]
//   }

//   const doughnutData = {
//     labels: categories,
//     datasets: [
//       {
//         label: 'Share',
//         data: counts,
//         backgroundColor: categories.map((c) => categoryColors[c])
//       }
//     ]
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold mb-4">Analytics</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 h-80">
//           <Bar data={barData} options={defaultOptions} />
//         </motion.div>
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 h-80">
//           <Doughnut data={doughnutData} options={defaultOptions} />
//         </motion.div>
//       </div>
//     </div>
//   )
// }
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
        // baseURL already ends with /api → use '/analytics/dashboard'
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
    { k: 'active',       label: 'Active',        color: 'bg-green-100 text-green-700' },
    { k: 'expiringSoon', label: 'Expiring soon', color: 'bg-yellow-100 text-yellow-700' },
    { k: 'expired',      label: 'Expired',       color: 'bg-red-100 text-red-700' },
    { k: 'consumed',     label: 'Consumed',      color: 'bg-blue-100 text-blue-700' }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <button
          className="rounded-lg bg-gray-100 px-3 py-1"
          onClick={async () => {
            setLoading(true)
            const { data } = await api.get('/analytics/dashboard')
            setData(data); setLoading(false)
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 h-80">
              <Bar data={barData} options={defaultOptions} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 h-80">
              <Doughnut data={doughnutData} options={defaultOptions} />
            </motion.div>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {statusRows.map(s => (
              <div key={s.k} className={`card p-4 ${s.color}`}>
                <p className="text-sm">{s.label}</p>
                <p className="text-2xl font-semibold">{status[s.k] ?? 0}</p>
              </div>
            ))}
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className="card p-4">
              <h3 className="font-medium mb-3">High value (Top 10)</h3>
              <ul className="space-y-2 text-sm">
                {data.topHighValue.map(i => (
                  <li key={i._id} className="flex items-center justify-between">
                    <span className="truncate">
                      {i.name} <span className="text-gray-500">({i.category})</span>
                    </span>
                    <span className="font-semibold">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
                  </li>
                ))}
                {!data.topHighValue.length && <p className="text-gray-500">No data</p>}
              </ul>
            </div>

            <div className="card p-4">
              <h3 className="font-medium mb-3">Low value (Top 10)</h3>
              <ul className="space-y-2 text-sm">
                {data.topLowValue.map(i => (
                  <li key={i._id} className="flex items-center justify-between">
                    <span className="truncate">
                      {i.name} <span className="text-gray-500">({i.category})</span>
                    </span>
                    <span className="font-semibold">₹{Number(i.estimatedCost || 0).toFixed(2)}</span>
                  </li>
                ))}
                {!data.topLowValue.length && <p className="text-gray-500">No data</p>}
              </ul>
            </div>

            <div className="card p-4">
              <h3 className="font-medium mb-3">Upcoming expirations</h3>
              <ul className="space-y-2 text-sm">
                {data.upcomingExpirations.map(i => (
                  <li key={i._id} className="flex items-center justify-between">
                    <span className="truncate">
                      {i.name} <span className="text-gray-500">({i.category})</span>
                    </span>
                    <span>{new Date(i.expiryDate).toLocaleDateString()}</span>
                  </li>
                ))}
                {!data.upcomingExpirations.length && <p className="text-gray-500">No upcoming expirations</p>}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
