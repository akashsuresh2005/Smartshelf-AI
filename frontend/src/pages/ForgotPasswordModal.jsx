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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-semibold mb-1">Reset password</h2>
        <p className="text-sm text-gray-500 mb-4">Enter your email and we’ll send a reset link.</p>

        {message && <p className="mb-3 text-sm text-green-700 bg-green-50 p-2 rounded">{message}</p>}
        {error && <p className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</p>}

        <form onSubmit={sendReset} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-600 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  )
}
