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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const passwordValid = password.length >= 6
  const passwordsMatch = password === confirm

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!passwordValid) return setError('Password must be at least 6 characters')
    if (!passwordsMatch) return setError('Passwords do not match')

    setLoading(true)
    try {
      const data = await api.post('/auth/reset-password', { token, password })
      setInfo(data?.message || 'Password updated successfully. Redirecting to login…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error('[ResetPassword]', err)
      setError(err?.response?.data?.error || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  // No token in URL
  if (!token) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/60 rounded-lg p-6 sm:p-8 border border-slate-800/50 w-full max-w-md shadow-lg text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-200 mb-2">Invalid reset link</h2>
          <p className="text-sm sm:text-base text-slate-400 mb-5">
            This link is missing a reset token. Please use the link from your email, or request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-sm sm:text-base font-medium transition-colors"
          >
            Request new reset link
          </Link>
          <div className="mt-3">
            <Link to="/login" className="text-sm text-cyan-400 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-slate-900/60 rounded-lg p-6 sm:p-8 w-full max-w-md border border-slate-800/50 shadow-lg"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-cyan-400 mb-2">Choose a new password</h2>
        <p className="text-sm sm:text-base text-slate-500 mb-5">
          Enter a new password for your SmartShelf account.
        </p>

        {info && (
          <div className="mb-4 p-3 bg-green-950/50 border border-green-800/50 text-green-300 rounded-lg text-sm sm:text-base flex items-center gap-2">
            <span>✓</span> {info}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 text-red-300 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 sm:px-4 py-2 sm:py-2.5 pr-16 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {password.length > 0 && (
              <p className={`text-xs mt-1 ${passwordValid ? 'text-green-400' : 'text-slate-500'}`}>
                {passwordValid ? '✓ Good length' : 'Use at least 6 characters'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Confirm new password</label>
            <input
              type="password"
              required
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
            />
            {confirm.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
            )}
            {confirm.length > 0 && passwordsMatch && password.length > 0 && (
              <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !passwordValid || !passwordsMatch}
              className={`w-full sm:w-auto rounded-lg bg-indigo-600 text-white px-5 py-2.5 text-sm sm:text-base font-medium transition-colors ${
                loading || !passwordValid || !passwordsMatch
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-indigo-500'
              }`}
            >
              {loading ? 'Saving…' : 'Save password'}
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 px-5 py-2.5 text-sm sm:text-base font-medium transition-colors text-center"
            >
              Back to login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}