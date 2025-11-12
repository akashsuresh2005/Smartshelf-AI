import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // ✅ Corrected endpoint (no extra /api)
      const { data } = await api.post('/auth/login', { email, password })
      login(data.token)
      navigate('/dashboard')
    } catch (err) {
      console.error(err.response?.data || err.message)
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-4">Welcome back</h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-3">
          No account? <a href="/register" className="text-blue-600 underline">Register</a>
        </p>
      </motion.div>
    </div>
  )
}
