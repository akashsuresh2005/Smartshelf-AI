// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useRef, useEffect } from 'react'
import NotificationBell from './NotificationBell.jsx'

export default function Navbar({ onMenu }) {
  // Hooks must always run in the same order every render
  const { isAuthenticated, logout, user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { pathname } = useLocation() // keep this here, don't call conditionally

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
  const accentStyle = { backgroundColor: 'var(--accent, #06b6d4)' }

  // Instead of `if (pathname === '/login' || pathname === '/register') return null`
  // always render the component, but hide it on login/register pages to keep hooks stable.
  const hiddenOnAuth = pathname === '/login' || pathname === '/register'

  return (
    <header
      className={`site-navbar bg-slate-900 text-slate-100 border-b border-slate-800/60 backdrop-blur-sm transition-opacity ${
        hiddenOnAuth ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : ''
      }`}
      aria-hidden={hiddenOnAuth}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex items-center justify-between">
        {/* Brand + Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenu}
            aria-label="Toggle sidebar"
            className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-3 py-2 hover:bg-slate-700 hover:border-slate-600 transition-colors text-2xl"
            title="Menu"
          >
            ☰
          </button>

          <Link to="/" className="group flex items-center gap-3">
           <img src="/assets/logo.png" alt="logo" className="w-12 h-12 rounded-lg shadow-sm" />

            <div className="leading-tight">
              <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors block">
                Smart Shelf AI
              </span>
              <span className="text-xs text-slate-400 hidden lg:block">Organise, track & save</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-lg">
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/dashboard">Dashboard</Link>
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/add">Add Item</Link>
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/analytics">Analytics</Link>
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/notifications">Notifications</Link>
          {isAuthenticated && <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/activity-log">Activity</Link>}
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/assistant">Assistant</Link>

          <div className="mx-1"><NotificationBell className="text-slate-200" /></div>

          {isAuthenticated ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={open}
                className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 hover:bg-slate-700 hover:border-slate-600 transition-colors"
              >
                <span className="w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold text-lg shadow-sm" style={accentStyle}>
                  {initial}
                </span>
                <span className="hidden md:inline text-lg">{displayName}</span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50">
                  <div className="p-4 text-sm text-slate-400">
                    Signed in as<br />
                    <span className="font-medium text-slate-200 text-lg">{displayName}</span>
                  </div>
                  <Link to="/profile" className="block px-5 py-3 text-slate-200 hover:bg-slate-800 transition-colors text-lg">Profile</Link>
                  <Link to="/settings" className="block px-5 py-3 text-slate-200 hover:bg-slate-800 transition-colors text-lg">Settings</Link>
                  <Link to="/activity-log" className="block px-5 py-3 text-slate-200 hover:bg-slate-800 transition-colors text-lg">Activity log</Link>
                  <button onClick={logout} className="w-full text-left px-5 py-3 text-slate-200 hover:bg-slate-800 transition-colors text-lg">Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-lg font-semibold hover:bg-indigo-500 transition-colors shadow-sm">Login</Link>
              <Link to="/register" className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-4 py-2 text-lg font-semibold hover:bg-slate-700 transition-colors shadow-sm">Register</Link>
            </>
          )}
        </nav>
      </div>

      {/* subtle bottom glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </header>
  )
}
