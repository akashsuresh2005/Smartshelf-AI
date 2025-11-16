import { useState } from 'react'
import api from '../utils/api.js'

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const sendReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setMessage('If that email exists, we sent a reset link.')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900/80 rounded-2xl p-6 w-full max-w-sm border border-slate-800/50 shadow-lg">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-2">Reset password</h2>
        <p className="text-base text-slate-400 mb-4">
          Enter your email and we’ll send a reset link.
        </p>

        {message && (
          <p className="mb-3 text-sm text-green-300 bg-green-950/50 p-3 rounded-lg">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-3 text-sm text-red-300 bg-red-950/50 p-3 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={sendReset} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
          />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-slate-400 hover:text-slate-200 hover:underline transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
