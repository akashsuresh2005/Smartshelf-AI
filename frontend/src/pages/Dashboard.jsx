// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import api from '../utils/api.js'
// import ItemCard from '../components/ItemCard.jsx'
// import ReminderCard from '../components/ReminderCard.jsx'
// import NotificationBell from '../components/NotificationBell.jsx'
// import { evaluateBadges, moneySaved } from '../utils/helpers.js'

// export default function Dashboard() {
//   const [items, setItems] = useState([])
//   const [reminders, setReminders] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [itemsRes, remindersRes] = await Promise.all([
//           api.get('/api/items'),
//           api.get('/api/reminders')
//         ])
//         setItems(itemsRes.data || [])
//         setReminders(remindersRes.data || [])
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [])

//   const badges = evaluateBadges(items)
//   const savings = moneySaved(items)

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-semibold">Dashboard</h1>
//         <NotificationBell />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
//           <h2 className="font-medium mb-2">Summary</h2>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <div className="p-3 rounded-lg bg-blue-50">
//               <p className="text-gray-600">Total items</p>
//               <p className="text-xl font-semibold">{items.length}</p>
//             </div>
//             <div className="p-3 rounded-lg bg-green-50">
//               <p className="text-gray-600">Money saved</p>
//               <p className="text-xl font-semibold">₹{savings.toFixed(2)}</p>
//             </div>
//             <div className="p-3 rounded-lg bg-pink-50">
//               <p className="text-gray-600">Badges</p>
//               <p className="text-xl font-semibold">{badges.length}</p>
//             </div>
//             <div className="p-3 rounded-lg bg-yellow-50">
//               <p className="text-gray-600">Reminders</p>
//               <p className="text-xl font-semibold">{reminders.length}</p>
//             </div>
//           </div>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-4 md:col-span-2">
//           <h2 className="font-medium mb-3">Expiring soon</h2>
//           {loading ? (
//             <p>Loading...</p>
//           ) : items.length ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//               {items
//                 .sort((a, b) => new Date(a.expiry) - new Date(b.expiry))
//                 .slice(0, 6)
//                 .map((item) => (
//                   <ItemCard key={item._id || item.id} item={item} />
//                 ))}
//             </div>
//           ) : (
//             <div className="flex items-center gap-3 text-gray-500">
//               <img src="/assets/illustrations/dashboard-empty.svg" alt="empty" className="w-20 h-20" />
//               <p>No items yet — add your first!</p>
//             </div>
//           )}
//         </motion.div>
//       </div>

//       <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-4 mt-6">
//         <h2 className="font-medium mb-3">Upcoming reminders</h2>
//         <div className="space-y-3">
//           {reminders.slice(0, 5).map((r) => (
//             <ReminderCard key={r._id || r.id} reminder={r} />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   )
// }



// frontend/src/pages/Dashboard.jsx
// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import ItemCard from '../components/ItemCard.jsx'
import ReminderCard from '../components/ReminderCard.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import { evaluateBadges, moneySaved } from '../utils/helpers.js'

// new components
import ItemFilters from '../components/ItemFilters.jsx'
import ItemDetailsModal from '../components/ItemDetailsModal.jsx'
import EditItemModal from '../components/EditItemModal.jsx'
import SwipeableRow from '../components/SwipeableRow.jsx'

// web-push helper (named export)
import { ensureSubscribed } from '../utils/pushClient.js'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [reminders, setReminders] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingReminders, setLoadingReminders] = useState(true)

  const [selectedItem, setSelectedItem] = useState(null)
  const [editItem, setEditItem] = useState(null)

  // ensure browser push subscription for logged-in user
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) ensureSubscribed().catch(() => {})
  }, [])

  // load reminders once
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reminders')
        setReminders(data || [])
      } finally {
        setLoadingReminders(false)
      }
    }
    load()
  }, [])

  const badges = evaluateBadges(items)
  const savings = moneySaved(items)

  const refreshAfterEdit = async () => {
    const { data } = await api.get('/items')
    setItems(data.items || data || [])
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    await api.delete(`/items/${id}`)
    setItems((old) => old.filter((x) => x._id !== id))
  }

  const isLoading = loadingItems || loadingReminders

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <NotificationBell />
      </div>

      {/* Filters + server-side list loader */}
      <div className="card p-4 mb-4">
        <ItemFilters
          onData={(data) => {
            setItems(data)
            setLoadingItems(false)
          }}
          onLoadingChange={(v) => setLoadingItems(Boolean(v))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
          <h2 className="font-medium mb-2">Summary</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-gray-600">Total items</p>
              <p className="text-xl font-semibold">{items.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <p className="text-gray-600">Money saved</p>
              <p className="text-xl font-semibold">₹{savings.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-pink-50">
              <p className="text-gray-600">Badges</p>
              <p className="text-xl font-semibold">{badges.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <p className="text-gray-600">Reminders</p>
              <p className="text-xl font-semibold">{reminders.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-4 md:col-span-2">
          <h2 className="font-medium mb-3">Items</h2>

          {isLoading ? (
            <p>Loading...</p>
          ) : items.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <SwipeableRow
                  key={item._id || item.id}
                  onDelete={() => handleDelete(item._id)}
                  onEdit={() => setEditItem(item)}
                >
                  <ItemCard
                    item={item}
                    onClick={() => setSelectedItem(item)}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => handleDelete(item._id)}
                  />
                </SwipeableRow>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-500">
              <p>No items yet — add your first!</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-4 mt-6">
        <h2 className="font-medium mb-3">Upcoming reminders</h2>
        <div className="space-y-3">
          {reminders.slice(0, 5).map((r) => (
            <ReminderCard key={r._id || r.id} reminder={r} />
          ))}
        </div>
      </motion.div>

      {/* Details modal */}
      {selectedItem && (
        <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Edit modal */}
      {editItem && (
        <EditItemModal
          item={editItem}
          onSaved={refreshAfterEdit}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  )
}
