import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    try {
      await api.post('/auth/forgot-password', { email })
      setInfo('If that email exists, a reset link was sent (check inbox / spam).')
    } catch (err) {
      console.error(err)
      setError('Failed to request reset. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Reset password</h2>
        <p className="text-sm text-gray-500 mb-4">Enter your account email and we’ll send a reset link.</p>

        {info && <div className="mb-3 p-2 bg-green-50 text-green-800 rounded">{info}</div>}
        {error && <div className="mb-3 p-2 bg-red-50 text-red-800 rounded">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input type="email" className="w-full rounded-lg border-gray-200 p-2" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <div className="flex gap-2">
            <button disabled={loading} className="rounded-lg bg-indigo-600 text-white px-4 py-2">{loading ? 'Sending...' : 'Send reset link'}</button>
            <Link to="/login" className="rounded-lg border px-4 py-2 text-sm self-center">Back</Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
