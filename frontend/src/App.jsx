import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddItem from './pages/AddItem.jsx'
import Analytics from './pages/Analytics.jsx'
import Notifications from './pages/Notifications.jsx'
import ChatBotAssistant from './pages/ChatBotAssistant.jsx'
import AIChatWidget from './components/AIChatWidget.jsx'
import { useAuth } from './context/AuthContext.jsx'
import ActivityLog from './pages/ActivityLog.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, loading, user } = useAuth()

  // Apply theme + accent globally when user changes theme/accent
  useEffect(() => {
    if (!user) return

    // user may be JWT payload (earlier) or server user document (after refresh)
    const accent = user.accent ?? (user?.settings?.accent) ?? (document.documentElement.style.getPropertyValue('--accent') || '#0b5fff')
    document.documentElement.style.setProperty('--accent', accent)

    const theme = user.theme ?? user?.settings?.theme ?? 'light'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // system or unknown: remove explicit class (you may add matchMedia if needed)
      document.documentElement.classList.remove('dark')
    }
  }, [user])

  const Protected = ({ children }) => (isAuthenticated ? children : <Navigate to="/login" replace />)

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenu={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/add" element={<Protected><AddItem /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/assistant" element={<Protected><ChatBotAssistant /></Protected>} />
          <Route path="/activity-log" element={<Protected><ActivityLog /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>

      <AIChatWidget />
    </div>
  )
}
