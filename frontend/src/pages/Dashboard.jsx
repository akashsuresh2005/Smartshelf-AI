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

// new components
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
    <div className="bg-slate-950 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-cyan-400">Dashboard</h1>
          <p className="text-base text-slate-500 mt-1">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/60 rounded-lg p-5 mb-4 border border-slate-800/50">
        <ItemFilters
          onData={(data) => {
            setItems(data)
            setLoadingItems(false)
          }}
          onLoadingChange={(v) => setLoadingItems(Boolean(v))}
        />
      </div>

      {/* Summary + Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50"
        >
          <h2 className="text-lg font-medium text-slate-300 mb-3">Summary</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Total items</p>
              <p className="text-xl font-semibold text-slate-200">{items.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Money saved</p>
              <p className="text-xl font-semibold text-green-400">₹{savings.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Badges</p>
              <p className="text-xl font-semibold text-pink-400">{badges.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60">
              <p className="text-slate-400">Reminders</p>
              <p className="text-xl font-semibold text-yellow-400">{reminders.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 md:col-span-2"
        >
          <h2 className="text-lg font-medium text-slate-300 mb-3">Items</h2>
          {loadingItems ? (
            <p className="text-slate-500 text-base py-6">Loading…</p>
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
            <div className="flex items-center gap-3 text-slate-500 py-6">
              <p>No items yet — add your first!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 mt-6"
      >
        <h2 className="text-lg font-medium text-slate-300 mb-3">Upcoming reminders</h2>
        {loadingReminders ? (
          <p className="text-slate-500 text-base py-6">Loading…</p>
        ) : reminders.length ? (
          <div className="space-y-3">
            {reminders.slice(0, 5).map((r) => (
              <ReminderCard key={r._id || r.id} reminder={r} />
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-base py-6">No reminders yet.</div>
        )}
      </motion.div>

      {/* Modals */}
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
