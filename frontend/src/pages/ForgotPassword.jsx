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
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-slate-900/60 rounded-lg p-6 w-full max-w-md border border-slate-800/50"
      >
        <h2 className="text-3xl font-semibold text-cyan-400 mb-2">Reset password</h2>
        <p className="text-base text-slate-500 mb-4">
          Enter your account email and we’ll send a reset link.
        </p>

        {info && <div className="mb-3 p-3 bg-green-950 text-green-300 rounded-lg text-sm">{info}</div>}
        {error && <div className="mb-3 p-3 bg-red-950 text-red-300 rounded-lg text-sm">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input 
            type="email" 
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
            placeholder="you@example.com" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            required 
          />
          <div className="flex gap-3">
            <button 
              disabled={loading} 
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <Link 
              to="/login" 
              className="rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Back
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
