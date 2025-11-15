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
      setTimeout(()=>navigate('/login'), 1400)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="card p-6">
          <p className="text-sm text-gray-600">Missing reset token. Use the link from your email.</p>
          <Link to="/forgot-password" className="text-indigo-600 underline mt-3 block">Request a new reset email</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Choose a new password</h2>
        {info && <div className="mb-3 p-2 bg-green-50 text-green-800 rounded">{info}</div>}
        {error && <div className="mb-3 p-2 bg-red-50 text-red-800 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input type="password" className="w-full rounded-lg border-gray-200 p-2" placeholder="New password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <input type="password" className="w-full rounded-lg border-gray-200 p-2" placeholder="Confirm password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required />
          <div className="flex gap-2">
            <button disabled={loading} className="rounded-lg bg-indigo-600 text-white px-4 py-2">{loading ? 'Saving...' : 'Save password'}</button>
            <Link to="/login" className="rounded-lg border px-4 py-2 text-sm self-center">Back</Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
