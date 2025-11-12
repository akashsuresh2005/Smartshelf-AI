import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // ✅ Corrected endpoint
      await api.post('/auth/signup', { name, email, password })
      navigate('/login')
    } catch (err) {
      console.error(err.response?.data || err.message)
      setError(err.response?.data?.error || 'Registration failed')
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
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition"
          >
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
