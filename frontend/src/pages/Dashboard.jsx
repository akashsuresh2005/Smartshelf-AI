// // src/pages/Dashboard.jsx
// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import api from '../utils/api.js'
// import ItemCard from '../components/ItemCard.jsx'
// import ReminderCard from '../components/ReminderCard.jsx'
// import NotificationBell from '../components/NotificationBell.jsx'
// import { evaluateBadges, moneySaved, mostUsedLocation, stockValueEstimation } from '../utils/helpers.js'
// import logActivity from '../utils/logActivity.js'
// import { useAuth } from '../context/AuthContext.jsx'

// // new components
// import ItemFilters from '../components/ItemFilters.jsx'
// import ItemDetailsModal from '../components/ItemDetailsModal.jsx'
// import EditItemModal from '../components/EditItemModal.jsx'
// import SwipeableRow from '../components/SwipeableRow.jsx'

// const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

// export default function Dashboard() {
//   const { user } = useAuth()
//   const [items, setItems] = useState([])
//   const [reminders, setReminders] = useState([])
//   const [loadingItems, setLoadingItems] = useState(true)
//   const [loadingReminders, setLoadingReminders] = useState(true)

//   const [selectedItem, setSelectedItem] = useState(null)
//   const [editItem, setEditItem] = useState(null)

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const { data } = await api.get('/items')
//         setItems(data.items || data || [])
//       } catch (err) {
//         console.error(err)
//       } finally {
//         setLoadingItems(false)
//       }
//     }
//     load()
//   }, [])

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const { data } = await api.get('/reminders')
//         setReminders(data || [])
//       } catch (err) {
//         console.error(err)
//       } finally {
//         setLoadingReminders(false)
//       }
//     }
//     load()
//   }, [])

//   const refreshItems = async () => {
//     try {
//       const { data } = await api.get('/items')
//       setItems(data.items || data || [])
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const handleDelete = async (id, itemName) => {
//     if (!confirm('Delete this item?')) return
//     try {
//       await api.delete(`/items/${id}`)
//       setItems((old) => old.filter((x) => x._id !== id))
//       await logActivity({
//         userId: user?.id,
//         userName: user?.name || user?.email,
//         type: 'item:delete',
//         message: `${user?.name || user?.email} deleted item "${itemName}"`,
//         meta: { itemId: id, itemName }
//       })
//     } catch (err) {
//       console.error(err)
//       alert('Failed to delete item')
//     }
//   }

//   const handleUpdated = async (updated) => {
//     setItems((old) => old.map(it => (it._id === updated._id ? updated : it)))
//     try {
//       await logActivity({
//         userId: user?.id,
//         userName: user?.name || user?.email,
//         type: 'item:update',
//         message: `${user?.name || user?.email} updated "${updated.name}"`,
//         meta: { itemId: updated._id, item: updated }
//       })
//     } catch (e) { console.warn(e) }
//   }

//   // derived summary values
//   const badges = evaluateBadges(items)
//   const savings = moneySaved(items)
//   const topLocation = mostUsedLocation(items)
//   const stockEst = stockValueEstimation(items)

//   return (
//     <div className="bg-slate-950 min-h-screen p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-3xl font-semibold text-cyan-400">Dashboard</h1>
//           <p className="text-base text-slate-500 mt-1">
//             Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
//           </p>
//         </div>
//         <NotificationBell />
//       </div>

//       {/* Filters */}
//       <div className="bg-slate-900/60 rounded-lg p-5 mb-4 border border-slate-800/50">
//         <ItemFilters
//           onData={(data) => {
//             setItems(data)
//             setLoadingItems(false)
//           }}
//           onLoadingChange={(v) => setLoadingItems(Boolean(v))}
//         />
//       </div>

//       {/* Summary + Items: changed grid so summary takes more vertical space */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Summary - make its contents bigger for better space utilization */}
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.18 }}
//           className="bg-slate-900/60 rounded-lg p-6 border border-slate-800/50 md:col-span-1"
//         >
//           <h2 className="text-xl font-semibold text-slate-300 mb-4">Summary</h2>

//           <div className="grid grid-cols-1 gap-4">
//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Total items</p>
//               <p className="text-2xl font-semibold text-slate-200">{items.length}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Money saved</p>
//               <p className="text-2xl font-semibold text-green-400">{currencyFormatter.format(savings)}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Badges</p>
//               <p className="text-2xl font-semibold text-pink-400">{badges.length}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Reminders</p>
//               <p className="text-2xl font-semibold text-yellow-400">{reminders.length}</p>
//             </div>

//             {/* NEW: Most used location */}
//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Most used storage location</p>
//               <p className="text-2xl font-semibold text-slate-200">{topLocation || '—'}</p>
//             </div>

//             {/* NEW: Stock value estimation */}
//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Stock value estimation</p>
//               <p className="text-2xl font-semibold text-emerald-400">{currencyFormatter.format(stockEst)}</p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Items: span remaining columns */}
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.18 }}
//           className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 md:col-span-3"
//         >
//           <h2 className="text-lg font-medium text-slate-300 mb-3">Items</h2>
//           {loadingItems ? (
//             <p className="text-slate-500 text-base py-6">Loading…</p>
//           ) : items.length ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//               {items.map((item) => (
//                 <SwipeableRow
//                   key={item._id || item.id}
//                   onDelete={() => handleDelete(item._id, item.name)}
//                   onEdit={() => setEditItem(item)}
//                 >
//                   <ItemCard
//                     item={item}
//                     onClick={() => setSelectedItem(item)}
//                     onEdit={() => setEditItem(item)}
//                     onDelete={() => handleDelete(item._id, item.name)}
//                   />
//                 </SwipeableRow>
//               ))}
//             </div>
//           ) : (
//             <div className="flex items-center gap-3 text-slate-500 py-6">
//               <p>No items yet — add your first!</p>
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Reminders */}
//       <motion.div
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.18 }}
//         className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 mt-6"
//       >
//         <h2 className="text-lg font-medium text-slate-300 mb-3">Upcoming reminders</h2>
//         {loadingReminders ? (
//           <p className="text-slate-500 text-base py-6">Loading…</p>
//         ) : reminders.length ? (
//           <div className="space-y-3">
//             {reminders.slice(0, 5).map((r) => (
//               <ReminderCard key={r._id || r.id} reminder={r} />
//             ))}
//           </div>
//         ) : (
//           <div className="text-slate-500 text-base py-6">No reminders yet.</div>
//         )}
//       </motion.div>

//       {/* Modals */}
//       {selectedItem && (
//         <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
//       )}
//       {editItem && (
//         <EditItemModal
//           item={editItem}
//           onSaved={() => { refreshItems(); setEditItem(null); }}
//           onClose={() => setEditItem(null)}
//           onUpdated={handleUpdated}
//         />
//       )}
//     </div>
//   )
// }


// // src/pages/Dashboard.jsx
// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import api from '../utils/api.js'
// import ItemCard from '../components/ItemCard.jsx'
// import ReminderCard from '../components/ReminderCard.jsx'
// import NotificationBell from '../components/NotificationBell.jsx'
// import { evaluateBadges, moneySaved, mostUsedLocation, stockValueEstimation } from '../utils/helpers.js'
// import logActivity from '../utils/logActivity.js'
// import { useAuth } from '../context/AuthContext.jsx'

// // new components
// import ItemFilters from '../components/ItemFilters.jsx'
// import ItemDetailsModal from '../components/ItemDetailsModal.jsx'
// import EditItemModal from '../components/EditItemModal.jsx'
// import SwipeableRow from '../components/SwipeableRow.jsx'

// const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

// export default function Dashboard() {
//   const { user } = useAuth()
//   const [items, setItems] = useState([])
//   const [reminders, setReminders] = useState([])
//   const [loadingItems, setLoadingItems] = useState(true)
//   const [loadingReminders, setLoadingReminders] = useState(true)

//   const [selectedItem, setSelectedItem] = useState(null)
//   const [editItem, setEditItem] = useState(null)

//   useEffect(() => {
//     const load = async () => {
//       try {
//         // api.get returns res.data (see src/utils/api.js)
//         const data = await api.get('/items')
//         // data may be an array, an object with items, or something else
//         const normalized = (data && typeof data === 'object') ? (data.items ?? data) : []
//         setItems(Array.isArray(normalized) ? normalized : [])
//       } catch (err) {
//         console.error('[dashboard] load items error', err)
//         setItems([])
//       } finally {
//         setLoadingItems(false)
//       }
//     }
//     load()
//   }, [])

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const data = await api.get('/reminders')
//         // ensure reminders is an array
//         setReminders(Array.isArray(data) ? data : (data?.reminders ?? []) )
//       } catch (err) {
//         console.error('[dashboard] load reminders error', err)
//         setReminders([])
//       } finally {
//         setLoadingReminders(false)
//       }
//     }
//     load()
//   }, [])

//   const refreshItems = async () => {
//     try {
//       const data = await api.get('/items')
//       const normalized = (data && typeof data === 'object') ? (data.items ?? data) : []
//       setItems(Array.isArray(normalized) ? normalized : [])
//     } catch (err) {
//       console.error('[dashboard] refresh items error', err)
//     }
//   }

//   const handleDelete = async (id, itemName) => {
//     if (!confirm('Delete this item?')) return
//     try {
//       await api.delete(`/items/${id}`)
//       setItems((old) => old.filter((x) => x._id !== id && x.id !== id))
//       await logActivity({
//         userId: user?.id,
//         userName: user?.name || user?.email,
//         type: 'item:delete',
//         message: `${user?.name || user?.email} deleted item "${itemName}"`,
//         meta: { itemId: id, itemName }
//       })
//     } catch (err) {
//       console.error(err)
//       alert('Failed to delete item')
//     }
//   }

//   const handleUpdated = async (updated) => {
//     setItems((old) => old.map(it => (it._id === updated._id ? updated : it)))
//     try {
//       await logActivity({
//         userId: user?.id,
//         userName: user?.name || user?.email,
//         type: 'item:update',
//         message: `${user?.name || user?.email} updated "${updated.name}"`,
//         meta: { itemId: updated._id, item: updated }
//       })
//     } catch (e) { console.warn(e) }
//   }

//   // derived summary values (safe with empty arrays)
//   const badges = evaluateBadges(items || [])
//   const savings = moneySaved(items || [])
//   const topLocation = mostUsedLocation(items || [])
//   const stockEst = stockValueEstimation(items || [])

//   return (
//     <div className="bg-slate-950 min-h-screen p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-3xl font-semibold text-cyan-400">Dashboard</h1>
//           <p className="text-base text-slate-500 mt-1">
//             Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
//           </p>
//         </div>
//         <NotificationBell />
//       </div>

//       {/* Filters */}
//       <div className="bg-slate-900/60 rounded-lg p-5 mb-4 border border-slate-800/50">
//         <ItemFilters
//           onData={(data) => {
//             // normalize incoming data
//             const normalized = (data && typeof data === 'object') ? (data.items ?? data) : data
//             setItems(Array.isArray(normalized) ? normalized : [])
//             setLoadingItems(false)
//           }}
//           onLoadingChange={(v) => setLoadingItems(Boolean(v))}
//         />
//       </div>

//       {/* Summary + Items */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.18 }}
//           className="bg-slate-900/60 rounded-lg p-6 border border-slate-800/50 md:col-span-1"
//         >
//           <h2 className="text-xl font-semibold text-slate-300 mb-4">Summary</h2>

//           <div className="grid grid-cols-1 gap-4">
//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Total items</p>
//               <p className="text-2xl font-semibold text-slate-200">{(items || []).length}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Money saved</p>
//               <p className="text-2xl font-semibold text-green-400">{currencyFormatter.format(savings)}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Badges</p>
//               <p className="text-2xl font-semibold text-pink-400">{badges.length}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Reminders</p>
//               <p className="text-2xl font-semibold text-yellow-400">{(reminders || []).length}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Most used storage location</p>
//               <p className="text-2xl font-semibold text-slate-200">{topLocation || '—'}</p>
//             </div>

//             <div className="p-4 rounded-lg bg-slate-800/60">
//               <p className="text-slate-400">Stock value estimation</p>
//               <p className="text-2xl font-semibold text-emerald-400">{currencyFormatter.format(stockEst)}</p>
//             </div>
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.18 }}
//           className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 md:col-span-3"
//         >
//           <h2 className="text-lg font-medium text-slate-300 mb-3">Items</h2>
//           {loadingItems ? (
//             <p className="text-slate-500 text-base py-6">Loading…</p>
//           ) : (items && items.length) ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//               {items.map((item) => (
//                 <SwipeableRow
//                   key={item._id || item.id}
//                   onDelete={() => handleDelete(item._id, item.name)}
//                   onEdit={() => setEditItem(item)}
//                 >
//                   <ItemCard
//                     item={item}
//                     onClick={() => setSelectedItem(item)}
//                     onEdit={() => setEditItem(item)}
//                     onDelete={() => handleDelete(item._id, item.name)}
//                   />
//                 </SwipeableRow>
//               ))}
//             </div>
//           ) : (
//             <div className="flex items-center gap-3 text-slate-500 py-6">
//               <p>No items yet — add your first!</p>
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Reminders */}
//       <motion.div
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.18 }}
//         className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 mt-6"
//       >
//         <h2 className="text-lg font-medium text-slate-300 mb-3">Upcoming reminders</h2>
//         {loadingReminders ? (
//           <p className="text-slate-500 text-base py-6">Loading…</p>
//         ) : (reminders && reminders.length) ? (
//           <div className="space-y-3">
//             {reminders.slice(0, 5).map((r) => (
//               <ReminderCard key={r._id || r.id} reminder={r} />
//             ))}
//           </div>
//         ) : (
//           <div className="text-slate-500 text-base py-6">No reminders yet.</div>
//         )}
//       </motion.div>

//       {/* Modals */}
//       {selectedItem && (
//         <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
//       )}
//       {editItem && (
//         <EditItemModal
//           item={editItem}
//           onSaved={() => { refreshItems(); setEditItem(null); }}
//           onClose={() => setEditItem(null)}
//           onUpdated={handleUpdated}
//         />
//       )}
//     </div>
//   )
// }
/// src/pages/Dashboard.jsx
// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import ItemCard from '../components/ItemCard.jsx'
import ReminderCard from '../components/ReminderCard.jsx'
import { evaluateBadges, moneySaved, mostUsedLocation, stockValueEstimation } from '../utils/helpers.js'
import logActivity from '../utils/logActivity.js'
import { useAuth } from '../context/AuthContext.jsx'

// components
import ItemFilters from '../components/ItemFilters.jsx'
import ItemDetailsModal from '../components/ItemDetailsModal.jsx'
import EditItemModal from '../components/EditItemModal.jsx'
import SwipeableRow from '../components/SwipeableRow.jsx'

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

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
        const data = await api.get('/items')
        const normalized = (data && typeof data === 'object') ? (data.items ?? data) : []
        setItems(Array.isArray(normalized) ? normalized : [])
      } catch (err) {
        console.error('items error', err)
        setItems([])
      } finally {
        setLoadingItems(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/reminders')
        setReminders(Array.isArray(data) ? data : (data?.reminders ?? []))
      } catch (err) {
        console.error('reminders error', err)
        setReminders([])
      } finally {
        setLoadingReminders(false)
      }
    }
    load()
  }, [])

  const refreshItems = async () => {
    try {
      const data = await api.get('/items')
      const normalized = (data && typeof data === 'object') ? (data.items ?? data) : []
      setItems(Array.isArray(normalized) ? normalized : [])
    } catch (err) {
      console.error('refresh error', err)
    }
  }

  const handleDelete = async (id, itemName) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/items/${id}`)
      setItems(old => old.filter(x => x._id !== id && x.id !== id))

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
    setItems(old => old.map(it => it._id === updated._id ? updated : it))

    try {
      await logActivity({
        userId: user?.id,
        userName: user?.name || user?.email,
        type: 'item:update',
        message: `${user?.name || user?.email} updated "${updated.name}"`,
        meta: { itemId: updated._id, item: updated }
      })
    } catch (err) {
      console.warn(err)
    }
  }

  // derived values
  const badges = evaluateBadges(items)
  const savings = moneySaved(items)
  const topLocation = mostUsedLocation(items)
  const stockEst = stockValueEstimation(items)

  return (
    <div className="bg-slate-950 min-h-screen p-6">
      
      {/* HEADER */}
      <div className="mb-4">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold text-cyan-400"
        >
          Dashboard
        </motion.h1>

        {/* WELCOME BLOCK - only blinking added */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.42 }}
          className="mt-2 rounded-lg px-4 py-3 bg-slate-900/40 border border-slate-800/40 max-w-2xl"
        >
          <div className="flex items-center justify-between gap-4">

            {/* Welcome Back (blink) */}
            <motion.span
              className="text-base text-slate-100 font-medium"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </motion.span>

            {/* Sparkle */}
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-amber-300"
            >
              ✨
            </motion.span>

            {/* Freshness line (blink) */}
            <motion.span
              className="text-sm text-slate-400"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              • Freshness tracking active · Auto reminders & insights enabled
            </motion.span>

          </div>
        </motion.div>
      </div>

      {/* FILTERS */}
      <div className="bg-slate-900/60 rounded-lg p-5 mb-4 border border-slate-800/50">
        <ItemFilters
          onData={(data) => {
            const normalized = (data && typeof data === 'object') ? (data.items ?? data) : data
            setItems(Array.isArray(normalized) ? normalized : [])
            setLoadingItems(false)
          }}
          onLoadingChange={v => setLoadingItems(Boolean(v))}
        />
      </div>

      {/* SUMMARY + ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-slate-900/60 rounded-lg p-6 border border-slate-800/50 md:col-span-1"
        >
          <h2 className="text-xl font-semibold text-slate-300 mb-4">Summary</h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Total items</p>
              <p className="text-2xl font-semibold text-slate-200">{items.length}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Money saved</p>
              <p className="text-2xl font-semibold text-green-400">{currencyFormatter.format(savings)}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Badges</p>
              <p className="text-2xl font-semibold text-pink-400">{badges.length}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Reminders</p>
              <p className="text-2xl font-semibold text-yellow-400">{reminders.length}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Most used storage location</p>
              <p className="text-2xl font-semibold text-slate-200">{topLocation || "—"}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Stock value estimation</p>
              <p className="text-2xl font-semibold text-emerald-400">{currencyFormatter.format(stockEst)}</p>
            </div>
          </div>
        </motion.div>

        {/* ITEMS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 md:col-span-3"
        >
          <h2 className="text-lg font-medium text-slate-300 mb-3">Items</h2>

          {loadingItems ? (
            <p className="text-slate-500 py-6">Loading...</p>
          ) : items.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(item => (
                <motion.div
                  key={item._id || item.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <SwipeableRow
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
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 py-6">No items yet — add your first!</p>
          )}
        </motion.div>
      </div>

      {/* REMINDERS */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 mt-6"
      >
        <h2 className="text-lg font-medium text-slate-300 mb-3">Upcoming reminders</h2>
        {loadingReminders ? (
          <p className="text-slate-500 py-6">Loading...</p>
        ) : reminders.length ? (
          <div className="space-y-3">
            {reminders.slice(0, 5).map(r => (
              <ReminderCard key={r._id || r.id} reminder={r} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 py-6">No reminders yet.</p>
        )}
      </motion.div>

      {/* MODALS */}
      {selectedItem && (
        <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          onSaved={() => {
            refreshItems()
            setEditItem(null)
          }}
          onClose={() => setEditItem(null)}
          onUpdated={handleUpdated}
        />
      )}

    </div>
  )
}

