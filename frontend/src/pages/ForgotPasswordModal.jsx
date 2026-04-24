// import { useState } from 'react'
// import api from '../utils/api.js'

// export default function ForgotPasswordModal({ onClose }) {
//   const [email, setEmail] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState('')
//   const [error, setError] = useState('')

//   const sendReset = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setMessage('')
//     setError('')
//     try {
//       await api.post('/auth/forgot-password', { email })
//       setMessage('If that email exists, we sent a reset link.')
//     } catch (err) {
//       console.error(err)
//       setError('Something went wrong. Try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
//       <div className="bg-slate-900/80 rounded-2xl p-6 w-full max-w-sm border border-slate-800/50 shadow-lg">
//         <h2 className="text-2xl font-semibold text-cyan-400 mb-2">Reset password</h2>
//         <p className="text-base text-slate-400 mb-4">
//           Enter your email and we’ll send a reset link.
//         </p>

//         {message && (
//           <p className="mb-3 text-sm text-green-300 bg-green-950/50 p-3 rounded-lg">
//             {message}
//           </p>
//         )}
//         {error && (
//           <p className="mb-3 text-sm text-red-300 bg-red-950/50 p-3 rounded-lg">
//             {error}
//           </p>
//         )}

//         <form onSubmit={sendReset} className="space-y-4">
//           <input
//             type="email"
//             required
//             placeholder="you@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//           />

//           <button
//             disabled={loading}
//             className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm font-medium transition-colors"
//           >
//             {loading ? 'Sending…' : 'Send reset link'}
//           </button>
//         </form>

//         <button
//           onClick={onClose}
//           className="mt-4 w-full text-sm text-slate-400 hover:text-slate-200 hover:underline transition-colors"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   )
// }
// src/pages/ForgotPasswordModal.jsx
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
      setMessage('If that email exists, we sent a reset link. Check your inbox and spam folder.')
      setEmail('')
    } catch (err) {
      console.error('[ForgotPasswordModal]', err)
      const msg = err?.response?.data?.error
      setError(msg || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md border border-slate-800/50 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-cyan-400">Reset password</h2>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Enter your email and we'll send a reset link.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 ml-4 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-950/50 border border-green-800/50 text-green-300 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={sendReset} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-indigo-600 text-white px-4 py-2.5 text-sm sm:text-base font-medium transition-colors ${
              loading ? 'opacity-60 cursor-wait' : 'hover:bg-indigo-500'
            }`}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm sm:text-base text-slate-500 hover:text-slate-300 hover:underline transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}