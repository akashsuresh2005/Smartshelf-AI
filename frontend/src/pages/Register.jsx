// // src/pages/Register.jsx
// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import api from '../utils/api.js'

// export default function Register() {
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirm, setConfirm] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const navigate = useNavigate()

//   const passwordValid = password.length >= 8
//   const passwordsMatch = password === confirm

//   const onSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     if (!passwordValid) return setError('Password must be at least 8 characters.')
//     if (!passwordsMatch) return setError('Passwords do not match.')

//     setLoading(true)
//     try {
//       await api.post('/auth/signup', { name, email, password })
//       navigate('/login')
//     } catch (err) {
//       console.error(err.response?.data || err.message)
//       setError(err.response?.data?.error || 'Registration failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="bg-slate-950 min-h-screen flex items-center justify-center p-4 sm:p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 18 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.32 }}
//         className="w-full max-w-md"
//       >
//         <div className="bg-slate-900/60 rounded-lg p-5 sm:p-6 border border-slate-800/50">
//           <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-400 mb-2">Create your account</h1>
//           <p className="text-sm sm:text-base text-slate-500 mb-4">Sign up and start tracking your items.</p>

//           {error && (
//             <div className="mb-3 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300">
//               {error}
//             </div>
//           )}

//           <form onSubmit={onSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm text-slate-400 mb-1">Full name</label>
//               <input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//                 placeholder="Your full name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm text-slate-400 mb-1">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//                 placeholder="you@example.com"
//                 autoComplete="username"
//                 inputMode="email"
//               />
//             </div>

//             <div>
//               <label className="block text-sm text-slate-400 mb-1">Password</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 pr-16 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//                   placeholder="At least 8 characters"
//                   autoComplete="new-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((v) => !v)}
//                   className="absolute right-3 top-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
//                 >
//                   {showPassword ? 'Hide' : 'Show'}
//                 </button>
//               </div>
//               <p className={`text-xs mt-1 ${passwordValid ? 'text-green-400' : 'text-slate-500'}`}>
//                 {passwordValid ? 'Good — password length ok' : 'Use 8+ characters'}
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm text-slate-400 mb-1">Confirm password</label>
//               <input
//                 type="password"
//                 value={confirm}
//                 onChange={(e) => setConfirm(e.target.value)}
//                 required
//                 className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//                 placeholder="Repeat password"
//                 autoComplete="new-password"
//               />
//               {!passwordsMatch && confirm.length > 0 && (
//                 <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
//               )}
//             </div>

//             <div>
//               <button
//                 disabled={loading}
//                 className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition disabled:opacity-60 ${
//                   loading ? 'cursor-wait' : 'hover:bg-indigo-500'
//                 }`}
//               >
//                 {loading ? 'Creating account...' : 'Create account'}
//               </button>
//             </div>

//             <div className="text-sm text-slate-400 text-center">
//               Already have an account?{' '}
//               <a href="/login" className="text-cyan-400 underline">
//                 Sign in
//               </a>
//             </div>
//           </form>
//         </div>
//       </motion.div>
//     </div>
//   )
// }
// src/pages/Register.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ensureSubscribed } from '../utils/pushClient.js'
import { GoogleLogin } from '@react-oauth/google'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirm

  // ─── Existing email/password signup (unchanged) ───────────────────────────
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

  // ─── NEW: Google OAuth register/login ────────────────────────────────────
  // Google flow is the same endpoint as login — backend upserts the user
  const onGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    setError('')
    try {
      const data = await api.post('/auth/google', {
        credential: credentialResponse.credential
      })

      const token = data?.token || data?.accessToken || null
      if (!token) {
        setError('Google sign-up failed: no token returned')
        return
      }

      try { localStorage.setItem('token', token) } catch (e) { console.warn('localStorage write failed', e) }
      try { await login(token) } catch (e) { console.warn('Auth login() failed', e) }
      try { await ensureSubscribed() } catch (e) { console.warn('Push subscribe failed', e) }

      navigate('/dashboard')
    } catch (err) {
      console.error('Google register error', err)
      setError(err?.response?.data?.error || 'Google sign-up failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const onGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.')
  }

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/60 rounded-lg p-5 sm:p-6 border border-slate-800/50">
          <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-400 mb-2">Create your account</h1>
          <p className="text-sm sm:text-base text-slate-500 mb-5">Sign up and start tracking your items.</p>

          {error && (
            <div className="mb-4 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ✅ Google Sign-Up Button */}
          <div className="mb-4">
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-300 py-2.5 text-sm font-medium">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing up with Google…
              </div>
            ) : (
              <div className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full [&>div>div>div]:w-full [&_iframe]:!w-full">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                  useOneTap={false}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signup_with"
                  width="100%"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-xs text-slate-500 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Email/password form (all unchanged) */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
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
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 pr-16 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className={`text-xs mt-1 ${passwordValid ? 'text-green-400' : 'text-slate-500'}`}>
                {passwordValid ? 'Good — password length ok' : 'Use 8+ characters'}
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              {!passwordsMatch && confirm.length > 0 && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              disabled={loading}
              className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition disabled:opacity-60 ${
                loading ? 'cursor-wait' : 'hover:bg-indigo-500'
              }`}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-sm text-slate-400 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-cyan-400 underline">
                Sign in
              </a>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}