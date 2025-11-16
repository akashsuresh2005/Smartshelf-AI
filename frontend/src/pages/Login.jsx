// src/pages/Login.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'
import ForgotPasswordModal from './ForgotPasswordModal.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })

      if (data?.token) {
        localStorage.setItem('token', data.token)
      }

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
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        {/* Illustration / branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <div className="mb-4">
            <img src="/assets/illustrations/login-ill.svg" alt="Smart Shelf" className="w-56 h-auto" />
          </div>
          <h2 className="text-3xl font-bold text-cyan-400">Smart Shelf</h2>
          <p className="mt-3 text-base text-slate-400 text-center px-8">
            Track expiry dates — get reminders, reduce food waste and save money. Fast, private, and simple.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-slate-900/60 rounded-lg p-7 border border-slate-800/50">
          <h1 className="text-3xl font-semibold text-cyan-400 mb-2">Welcome back</h1>
          <p className="text-base text-slate-500 mb-4">Sign in to your account</p>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-3 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="you@example.com"
                autoComplete="username"
                inputMode="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 pr-16 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-cyan-400 hover:underline"
              >
                Forgot password?
              </button>
              <div className="text-slate-400">
                Need an account?{' '}
                <a className="text-cyan-400 underline" href="/register" rel="noopener noreferrer">
                  Create
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition disabled:opacity-60 ${
                  loading ? 'cursor-wait' : 'hover:bg-indigo-500'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            By signing in you agree to our <a className="underline">Terms</a> & <a className="underline">Privacy</a>.
          </div>
        </div>
      </motion.div>

      {/* Forgot password modal */}
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  )
}
