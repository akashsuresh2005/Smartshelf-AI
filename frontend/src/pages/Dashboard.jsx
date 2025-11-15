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
// frontend/src/pages/Dashboard.jsx
// src/pages/Dashboard.jsx
// Full updated dashboard with activity logging (delete + update) and clean UI.
//
// Important: This file expects:
// - api.js to be available at ../utils/api.js
// - logActivity helper at ../utils/logActivity.js
// - useAuth from ../context/AuthContext.jsx
// - ItemCard, ReminderCard, EditItemModal, ItemDetailsModal, SwipeableRow components exist
// - EditItemModal should call onSaved(updatedItem) when an item is successfully saved.

// frontend/src/pages/Dashboard.jsx
// (This is a minimal diff from what you already had — kept structure but ensured activity logging calls and EditItemModal hooks)
// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import ItemCard from '../components/ItemCard.jsx'
import ReminderCard from '../components/ReminderCard.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import { evaluateBadges, moneySaved } from '../utils/helpers.js'
import logActivity from '../utils/logActivity.js'
import { useAuth } from '../context/AuthContext.jsx'

// new components (kept as-is)
import ItemFilters from '../components/ItemFilters.jsx'
import ItemDetailsModal from '../components/ItemDetailsModal.jsx'
import EditItemModal from '../components/EditItemModal.jsx'
import SwipeableRow from '../components/SwipeableRow.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [reminders, setReminders] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingReminders, setLoadingReminders] = useState(true)

  const [selectedItem, setSelectedItem] = useState(null)
  const [editItem, setEditItem] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/items')
        setItems(data.items || data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingItems(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reminders')
        setReminders(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingReminders(false)
      }
    }
    load()
  }, [])

  const refreshItems = async () => {
    try {
      const { data } = await api.get('/items')
      setItems(data.items || data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id, itemName) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/items/${id}`)
      setItems((old) => old.filter((x) => x._id !== id))
      // log activity
      await logActivity({
        userId: user?.id,
        userName: user?.name || user?.email,
        type: 'item:delete',
        message: `${user?.name || user?.email} deleted item "${itemName}"`,
        meta: { itemId: id, itemName }
      })
    } catch (err) {
      console.error(err)
      alert('Failed to delete item')
    }
  }

  const handleUpdated = async (updated) => {
    setItems((old) => old.map(it => (it._id === updated._id ? updated : it)))
    try {
      await logActivity({
        userId: user?.id,
        userName: user?.name || user?.email,
        type: 'item:update',
        message: `${user?.name || user?.email} updated "${updated.name}"`,
        meta: { itemId: updated._id, item: updated }
      })
    } catch (e) { console.warn(e) }
  }

  const badges = evaluateBadges(items)
  const savings = moneySaved(items)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</p>
        </div>
        <NotificationBell />
      </div>

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

          {loadingItems ? (
            <p>Loading...</p>
          ) : items.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <SwipeableRow
                  key={item._id || item.id}
                  onDelete={() => handleDelete(item._id, item.name)}
                  onEdit={() => setEditItem(item)}
                >
                  <ItemCard
                    item={item}
                    onClick={() => setSelectedItem(item)}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => handleDelete(item._id, item.name)}
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

      {selectedItem && (
        <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          onSaved={() => { refreshItems(); setEditItem(null); }}
          onClose={() => setEditItem(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}


