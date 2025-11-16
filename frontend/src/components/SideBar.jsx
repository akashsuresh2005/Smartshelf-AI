// src/components/Sidebar.jsx
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'

export default function Sidebar({ open, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const linkBase = 'flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold transition-colors'
  const linkInactive = 'text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300'
  const linkActive = 'bg-slate-800/70 text-cyan-300 shadow-inner'

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <motion.aside
        ref={panelRef}
        initial={{ x: -320 }}
        animate={{ x: open ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="fixed top-0 left-0 h-full w-72 bg-slate-950/95 border-r border-slate-800/60 shadow-2xl p-6 z-50"
        aria-hidden={!open}
        aria-label="Side navigation"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src="/assets/logo-white.svg" alt="logo" className="w-12 h-12 rounded-lg shadow-sm" />
            <div>
              <div className="text-2xl font-bold text-white leading-tight">Smart Shelf</div>
              <div className="text-sm text-slate-400">Manage your pantry</div>
            </div>
          </div>

          <button
            className="text-slate-400 hover:text-slate-200 rounded-md p-2"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v8h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </NavLink>

          <NavLink
            to="/add"
            onClick={onClose}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Item
          </NavLink>

          <NavLink
            to="/analytics"
            onClick={onClose}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3v18h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 13v4M12 9v8M17 5v12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Analytics
          </NavLink>

          <NavLink
            to="/notifications"
            onClick={onClose}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 17H9a3 3 0 006 0zM18 8a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2V8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Notifications
          </NavLink>

          <NavLink
            to="/assistant"
            onClick={onClose}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2a7 7 0 00-7 7v3a7 7 0 0014 0V9a7 7 0 00-7-7zM8 21h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Assistant
          </NavLink>
        </nav>

        <div className="mt-8 border-t border-slate-800/50 pt-5">
          <div className="text-sm text-slate-400 mb-3">Quick actions</div>
          <div className="flex flex-col gap-3">
            <NavLink to="/scan" onClick={onClose} className={`${linkBase} ${linkInactive} px-3`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7V3h4M21 7V3h-4M3 17v4h4M21 17v4h-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Scan barcode
            </NavLink>

            <NavLink to="/add?quick=1" onClick={onClose} className={`${linkBase} ${linkInactive} px-3`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Quick add
            </NavLink>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="text-xs text-slate-500">v1.0 • © Smart Shelf</div>
        </div>
      </motion.aside>
    </>
  )
}
