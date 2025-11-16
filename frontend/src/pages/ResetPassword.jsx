// src/pages/ResetPassword.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

export default function ResetPassword() {
  const [search] = useSearchParams()
  const token = search.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true); setError(''); setInfo('')
    try {
      await api.post('/auth/reset-password', { token, password })
      setInfo('Password updated — you can now sign in.')
      setTimeout(() => navigate('/login'), 1400)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6">
        <div className="bg-slate-900/60 rounded-lg p-6 border border-slate-800/50 w-full max-w-md">
          <p className="text-base text-slate-400">
            Missing reset token. Use the link from your email.
          </p>
          <Link
            to="/forgot-password"
            className="text-cyan-400 underline mt-3 block"
          >
            Request a new reset email
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900/60 rounded-lg p-6 w-full max-w-md border border-slate-800/50"
      >
        <h2 className="text-3xl font-semibold text-cyan-400 mb-2">Choose a new password</h2>

        {info && (
          <div className="mb-3 p-3 bg-green-950/50 text-green-300 rounded-lg text-sm">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-3 p-3 bg-red-950/50 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <div className="flex gap-3">
            <button
              disabled={loading}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save password'}
            </button>
            <Link
              to="/login"
              className="rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 px-4 py-2.5 text-sm font-medium transition-colors self-center"
            >
              Back
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
