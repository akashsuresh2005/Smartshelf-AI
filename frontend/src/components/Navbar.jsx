import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useRef, useEffect } from 'react'
import NotificationBell from './NotificationBell.jsx'

export default function Navbar({ onMenu }) {
  const { isAuthenticated, logout, user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const displayName = user?.name || user?.email || 'User'
  const initial = (displayName && displayName.charAt(0).toUpperCase()) || 'U'
  const accentStyle = { backgroundColor: 'var(--accent, #0b5fff)' }

  return (
    <header className="bg-white shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            aria-label="Toggle sidebar"
            className="rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200"
          >
            ☰
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logo.svg" alt="logo" className="w-8 h-8" />
            <span className="font-semibold">Smart Shelf AI</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <Link to="/add" className="hover:text-indigo-600">Add Item</Link>
          <Link to="/analytics" className="hover:text-indigo-600">Analytics</Link>
          <Link to="/notifications" className="hover:text-indigo-600">Notifications</Link>

          {isAuthenticated && <Link to="/activity-log" className="hover:text-indigo-600">Activity</Link>}

          <Link to="/assistant" className="hover:text-indigo-600">Assistant</Link>

          <div className="mx-1"><NotificationBell /></div>

          {isAuthenticated ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={open}
                className="flex items-center gap-2 rounded-lg px-3 py-1 bg-gray-50 hover:bg-gray-100"
              >
                {/* Always show initial (no external avatar) */}
                <span
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center font-medium"
                  style={accentStyle}
                >
                  {initial}
                </span>

                <span className="hidden md:inline">{displayName}</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                  <div className="p-3 text-xs text-gray-500">
                    Signed in as
                    <br />
                    <span className="font-medium text-gray-800">{displayName}</span>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
                  <Link to="/settings" className="block px-4 py-2 hover:bg-gray-50">Settings</Link>
                  <Link to="/activity-log" className="block px-4 py-2 hover:bg-gray-50">Activity log</Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-lg bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700">Login</Link>
              <Link to="/register" className="rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
