import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddItem from './pages/AddItem.jsx'
import Analytics from './pages/Analytics.jsx'
import Notifications from './pages/Notifications.jsx'
import ChatBotAssistant from './pages/ChatBotAssistant.jsx' // <-- exact case
import AIChatWidget from './components/AIChatWidget.jsx'
import { useAuth } from './context/AuthContext.jsx'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, loading } = useAuth()

  const Protected = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenu={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Root: guests → /login, authed → /dashboard */}
          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />

          {/* Public auth routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

          {/* Protected app routes */}
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/add" element={<Protected><AddItem /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/assistant" element={<Protected><ChatBotAssistant /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>

      <AIChatWidget />
    </div>
  )
}
