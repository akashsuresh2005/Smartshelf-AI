import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirm

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!passwordValid) return setError('Password must be at least 8 characters.')
    if (!passwordsMatch) return setError('Passwords do not match.')

    setLoading(true)
    try {
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
    <div className="min-h-[82vh] flex items-center justify-center bg-gradient-to-b from-white to-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="w-full max-w-md"
      >
        <div className="card p-6">
          <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-4">Sign up and start tracking your items.</p>

          {error && <div className="mb-3 rounded-md bg-red-50 border border-red-100 p-2 text-sm text-red-700">{error}</div>}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2 text-sm text-gray-600 hover:text-indigo-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className={`text-xs mt-1 ${passwordValid ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordValid ? 'Good — password length ok' : 'Use 8+ characters'}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Repeat password"
              />
              {!passwordsMatch && confirm.length > 0 && (
                <p className="text-xs text-red-600 mt-1">Passwords don’t match</p>
              )}
            </div>

            <div>
              <button
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 text-white py-2 shadow hover:bg-indigo-700 transition"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 underline">
                Sign in
              </a>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
