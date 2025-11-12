import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30" onClick={onClose} />}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: open ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-soft p-4 z-50"
      >
        <h3 className="font-semibold mb-3">Menu</h3>
        <nav className="space-y-2 text-sm">
          <Link to="/dashboard" onClick={onClose} className="block p-2 rounded-lg hover:bg-gray-100">Dashboard</Link>
          <Link to="/add" onClick={onClose} className="block p-2 rounded-lg hover:bg-gray-100">Add Item</Link>
          <Link to="/analytics" onClick={onClose} className="block p-2 rounded-lg hover:bg-gray-100">Analytics</Link>
          <Link to="/notifications" onClick={onClose} className="block p-2 rounded-lg hover:bg-gray-100">Notifications</Link>
          <Link to="/assistant" onClick={onClose} className="block p-2 rounded-lg hover:bg-gray-100">Assistant</Link>
        </nav>
      </motion.aside>
    </>
  )
}
