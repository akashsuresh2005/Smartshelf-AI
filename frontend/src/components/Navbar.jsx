// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useRef, useEffect } from 'react'

export default function Navbar({ onMenu }) {
  // Hooks must always run in the same order every render
  const { isAuthenticated, logout, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

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
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Brand + Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onMenu}
            aria-label="Toggle sidebar"
            className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-2.5 py-1.5 sm:px-3 sm:py-2 hover:bg-slate-700 hover:border-slate-600 transition-colors text-xl sm:text-2xl"
            title="Menu"
          >
            ☰
          </button>

          <Link to="/" className="group flex items-center gap-2 sm:gap-3">
            <img src="/assets/logo.png" alt="logo" className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg shadow-sm" />

            <div className="leading-tight">
              <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors block">
                Smart Shelf AI
              </span>
              <span className="text-xs text-slate-400 hidden lg:block">Organise, track &amp; save</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-lg">
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/dashboard">Dashboard</Link>
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/add">Add Item</Link>
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/analytics">Analytics</Link>
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/notifications">Notifications</Link>
          {isAuthenticated && <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/activity-log">Activity</Link>}
          <Link className="text-slate-200 hover:text-cyan-300 transition-colors" to="/assistant">Assistant</Link>

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
                  {/* Profile link removed */}
                  <Link to="/settings" className="flex items-center gap-3 px-5 py-3 text-slate-200 hover:bg-slate-800 transition-colors text-lg">
                    <span className="text-xl">⚙️</span>
                    <span>Settings</span>
                  </Link>
                  <Link to="/activity-log" className="flex items-center gap-3 px-5 py-3 text-slate-200 hover:bg-slate-800 transition-colors text-lg">
                    <span className="text-xl">📊</span>
                    <span>Activity log</span>
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 text-left px-5 py-3 text-slate-200 hover:bg-slate-800 transition-colors text-lg">
                    <span className="text-xl">🚪</span>
                    <span>Sign out</span>
                  </button>
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

        {/* Mobile: right-side controls */}
        <div className="flex lg:hidden items-center gap-2">
          {isAuthenticated && (
            <span
              className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-base shadow-sm"
              style={accentStyle}
            >
              {initial}
            </span>
          )}
          {/* Mobile nav toggle */}
          <button
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label="Toggle navigation menu"
            className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-2.5 py-1.5 hover:bg-slate-700 hover:border-slate-600 transition-colors text-xl"
          >
            {mobileNavOpen ? '✕' : '⋮'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden border-t border-slate-800/60 bg-slate-900/98 px-4 py-3 flex flex-col gap-1">
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-cyan-300 hover:bg-slate-800 transition-colors text-base font-medium"
            to="/dashboard"
          >
            <span>📊</span> Dashboard
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-cyan-300 hover:bg-slate-800 transition-colors text-base font-medium"
            to="/add"
          >
            <span>➕</span> Add Item
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-cyan-300 hover:bg-slate-800 transition-colors text-base font-medium"
            to="/analytics"
          >
            <span>📈</span> Analytics
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-cyan-300 hover:bg-slate-800 transition-colors text-base font-medium"
            to="/notifications"
          >
            <span>🔔</span> Notifications
          </Link>
          {isAuthenticated && (
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-cyan-300 hover:bg-slate-800 transition-colors text-base font-medium"
              to="/activity-log"
            >
              <span>📋</span> Activity
            </Link>
          )}
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-cyan-300 hover:bg-slate-800 transition-colors text-base font-medium"
            to="/assistant"
          >
            <span>🤖</span> Assistant
          </Link>

          <div className="border-t border-slate-800 mt-2 pt-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-slate-400">
                  Signed in as <span className="font-medium text-slate-200">{displayName}</span>
                </div>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors text-base font-medium"
                >
                  <span>⚙️</span> Settings
                </Link>
                <Link
                  to="/activity-log"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors text-base font-medium"
                >
                  <span>📊</span> Activity log
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors text-base font-medium"
                >
                  <span>🚪</span> Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  className="flex-1 text-center rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-base font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-4 py-2.5 text-base font-semibold hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* subtle bottom glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </header>
  )
}