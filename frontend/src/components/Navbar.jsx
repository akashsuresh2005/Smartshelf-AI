import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar({ onMenu }) {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="bg-white shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className="rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200">☰</button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logo.svg" alt="logo" className="w-8 h-8" />
            <span className="font-semibold">Smart Shelf AI</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
              <Link to="/add" className="hover:text-blue-600">Add Item</Link>
              <Link to="/analytics" className="hover:text-blue-600">Analytics</Link>
              <Link to="/notifications" className="hover:text-blue-600">Notifications</Link>
              <Link to="/assistant" className="hover:text-blue-600">Assistant</Link>
              <button onClick={logout} className="rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">Login</Link>
              <Link to="/register" className="rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
