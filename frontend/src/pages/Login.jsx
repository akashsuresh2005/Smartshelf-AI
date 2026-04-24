// // src/pages/Login.jsx
// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext.jsx'
// import api from '../utils/api.js'
// import ForgotPasswordModal from './ForgotPasswordModal.jsx'
// import { ensureSubscribed } from '../utils/pushClient.js'

// export default function Login() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [forgotOpen, setForgotOpen] = useState(false)

//   const navigate = useNavigate()
//   const { login } = useAuth()

//   const onSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const data = await api.post('/auth/login', { email, password })

//       if (data?.error) {
//         setError(data.error)
//         setLoading(false)
//         return
//       }

//       const token = data?.token || data?.accessToken || null
//       if (!token) {
//         setError('Login failed: no token returned')
//         setLoading(false)
//         return
//       }

//       try { localStorage.setItem('token', token) } catch (e) { console.warn('localStorage write failed', e) }
//       try { await login(token) } catch (e) { console.warn('Auth login() failed', e) }

//       // ✅ Register push subscription after login
//       await ensureSubscribed()

//       navigate('/dashboard')
//     } catch (err) {
//       console.error('Login error', err)
//       const serverMsg = err?.response?.data?.error || err?.message || 'Invalid credentials'
//       setError(serverMsg)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="bg-slate-950 min-h-screen grid grid-cols-1 md:grid-cols-2">
//       <motion.div
//         initial={{ opacity: 0, x: -30 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.6 }}
//         className="flex flex-col justify-center items-start px-6 sm:px-10 md:px-20 py-8 sm:py-10 md:ml-[-40px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b md:border-b-0 md:border-r border-slate-800/50 rounded-none md:rounded-3xl"
//       >
//         <div className="max-w-2xl w-full">
//           <motion.h2
//             initial={{ opacity: 0 }}
//             animate={{ opacity: [0.3, 1, 0.3] }}
//             transition={{ repeat: Infinity, duration: 3 }}
//             className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6"
//           >
//             Let technology handle the details
//           </motion.h2>
//           <p className="text-base sm:text-lg text-slate-300 font-medium mb-6 sm:mb-10">
//             Live smarter every day — tracking, saving, and staying fresh without even trying.
//           </p>

//           <div className="space-y-3 sm:space-y-5 text-slate-300 text-sm">
//             {[
//               {
//                 title: '🧠 Smart Tracking',
//                 color: 'text-cyan-300',
//                 description: 'Track groceries, medicines, cosmetics, and more with intelligent organization.',
//               },
//               {
//                 title: '⏰ Expiry Alerts',
//                 color: 'text-indigo-300',
//                 description: 'Get notified before items expire — reduce waste and stay ahead.',
//               },
//               {
//                 title: '🤖 AI Assistant',
//                 color: 'text-purple-300',
//                 description: 'Receive smart storage tips and usage suggestions tailored to your shelf.',
//               },
//             ].map((feature, idx) => (
//               <motion.div
//                 key={idx}
//                 whileHover={{ scale: 1.05 }}
//                 className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/40 shadow-lg hover:shadow-cyan-800/30 transition-all duration-300"
//               >
//                 <h3 className={`${feature.color} font-semibold text-base sm:text-lg mb-1`}>{feature.title}</h3>
//                 <p>{feature.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       <div className="flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="w-full max-w-md bg-slate-900/60 rounded-xl p-5 sm:p-7 border border-slate-800/50 shadow-xl"
//         >
//           <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-400 mb-2">Welcome back</h1>
//           <p className="text-sm sm:text-base text-slate-500 mb-4">Sign in to your account</p>

//           {error && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="mb-3 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300"
//               role="alert"
//               aria-live="polite"
//             >
//               {error}
//             </motion.div>
//           )}

//           <form onSubmit={onSubmit} className="space-y-4" noValidate>
//             <div>
//               <label htmlFor="email" className="block text-sm text-slate-400 mb-1">Email</label>
//               <input
//                 id="email"
//                 name="email"
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
//               <label htmlFor="password" className="block text-sm text-slate-400 mb-1">Password</label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 pr-16 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//                   placeholder="••••••••"
//                   autoComplete="current-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((v) => !v)}
//                   className="absolute right-3 top-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
//                 >
//                   {showPassword ? 'Hide' : 'Show'}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition ${
//                 loading ? 'cursor-wait opacity-60' : 'hover:bg-indigo-500'
//               }`}
//             >
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>
//         </motion.div>
//       </div>

//       {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
//     </div>
//   )
// }





// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext.jsx'
// import api from '../utils/api.js'
// import ForgotPasswordModal from './ForgotPasswordModal.jsx'
// import { ensureSubscribed } from '../utils/pushClient.js'

// export default function Login() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [forgotOpen, setForgotOpen] = useState(false)

//   const navigate = useNavigate()
//   const { login } = useAuth()

//   const onSubmit = async (e) => {
//   e.preventDefault()
//   setLoading(true)
//   setError('')

//   try {
//     // NOTE: your api instance returns res.data directly (see src/utils/api.js)
//     const data = await api.post('/auth/login', { email, password })

//     // If backend returned an error payload (sometimes 200 + { error: '...' })
//     if (data?.error) {
//       setError(data.error)
//       setLoading(false)
//       return
//     }

//     // Extract token (support token or accessToken keys)
//     const token = data?.token || data?.accessToken || null
//     if (!token) {
//       setError('Login failed: no token returned')
//       setLoading(false)
//       return
//     }

//     // Save token safely
//     try { localStorage.setItem('token', token) } catch (e) { console.warn('localStorage write failed', e) }

//     // Update auth context / user state
//     try { await login(token) } catch (e) { console.warn('Auth login() failed', e) }

//     // ✅ ADD THIS (FIX FOR PUSH NOT WORKING)
//     try { await ensureSubscribed() } catch (e) { console.warn('Push subscribe failed', e) }

//     // Redirect to dashboard
//     navigate('/dashboard')

//   } catch (err) {
//     console.error('Login error', err)
//     const serverMsg = err?.response?.data?.error || err?.message || 'Invalid credentials'
//     setError(serverMsg)
//   } finally {
//     setLoading(false)
//   }
// }

//   return (
//     <div className="bg-slate-950 min-h-screen grid grid-cols-1 md:grid-cols-2">
//       {/* Left half - expanded left only */}
//       <motion.div
//         initial={{ opacity: 0, x: -30 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.6 }}
//         className="flex flex-col justify-center items-start px-20 py-10 ml-[-40px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-800/50 rounded-3xl"
//       >
//         <div className="max-w-2xl">
//           <motion.h2
//             initial={{ opacity: 0 }}
//             animate={{ opacity: [0.3, 1, 0.3] }}
//             transition={{ repeat: Infinity, duration: 3 }}
//             className="text-5xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6"
//           >
//             Let technology handle the details
//           </motion.h2>
//           <p className="text-lg text-slate-300 font-medium mb-10">
//             Live smarter every day — tracking, saving, and staying fresh without even trying.
//           </p>

//           <div className="space-y-5 text-slate-300 text-sm">
//             {[
//               {
//                 title: '🧠 Smart Tracking',
//                 color: 'text-cyan-300',
//                 description: 'Track groceries, medicines, cosmetics, and more with intelligent organization.',
//               },
//               {
//                 title: '⏰ Expiry Alerts',
//                 color: 'text-indigo-300',
//                 description: 'Get notified before items expire — reduce waste and stay ahead.',
//               },
//               {
//                 title: '🤖 AI Assistant',
//                 color: 'text-purple-300',
//                 description: 'Receive smart storage tips and usage suggestions tailored to your shelf.',
//               },
//             ].map((feature, idx) => (
//               <motion.div
//                 key={idx}
//                 whileHover={{ scale: 1.05 }}
//                 className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40 shadow-lg hover:shadow-cyan-800/30 transition-all duration-300"
//               >
//                 <h3 className={`${feature.color} font-semibold text-lg mb-1`}>{feature.title}</h3>
//                 <p>{feature.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Right half - login form centered */}
//       <div className="flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="w-full max-w-md bg-slate-900/60 rounded-xl p-7 border border-slate-800/50 shadow-xl"
//         >
//           <h1 className="text-3xl font-semibold text-cyan-400 mb-2">Welcome back</h1>
//           <p className="text-base text-slate-500 mb-4">Sign in to your account</p>

//           {error && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="mb-3 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300"
//               role="alert"
//               aria-live="polite"
//             >
//               {error}
//             </motion.div>
//           )}

//           <form onSubmit={onSubmit} className="space-y-4" noValidate>
//             <div>
//               <label htmlFor="email" className="block text-sm text-slate-400 mb-1">Email</label>
//               <input
//                 id="email"
//                 name="email"
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
//               <label htmlFor="password" className="block text-sm text-slate-400 mb-1">Password</label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 pr-16 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//                   placeholder="••••••••"
//                   autoComplete="current-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((v) => !v)}
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                   className="absolute right-3 top-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
//                 >
//                   {showPassword ? 'Hide' : 'Show'}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between text-sm">
//               <button
//                 type="button"
//                 onClick={() => setForgotOpen(true)}
//                 className="text-cyan-400 hover:underline transition"
//               >
//                 Forgot password?
//               </button>
//               <div className="text-slate-400">
//                 Need an account?{' '}
//                 <a className="text-cyan-400 underline hover:text-indigo-400 transition" href="/register" rel="noopener noreferrer">
//                   Create
//                 </a>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition duration-300 ${
//                   loading ? 'cursor-wait opacity-60' : 'hover:bg-indigo-500'
//                 }`}
//               >
//                 {loading ? 'Signing in...' : 'Sign in'}
//               </button>
//             </div>
//           </form>

//           <div className="mt-4 text-center text-xs text-slate-500">
//             By signing in you agree to our <a className="underline hover:text-cyan-400 transition">Terms</a> & <a className="underline hover:text-cyan-400 transition">Privacy</a>.
//           </div>
//         </motion.div>
//       </div>

//       {/* Forgot password modal */}
//       {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
//     </div>
//   )
// }
// src/pages/Login.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'
import ForgotPasswordModal from './ForgotPasswordModal.jsx'
import { ensureSubscribed } from '../utils/pushClient.js'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  // ─── Existing email/password login (unchanged) ───────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await api.post('/auth/login', { email, password })

      if (data?.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      const token = data?.token || data?.accessToken || null
      if (!token) {
        setError('Login failed: no token returned')
        setLoading(false)
        return
      }

      try { localStorage.setItem('token', token) } catch (e) { console.warn('localStorage write failed', e) }
      try { await login(token) } catch (e) { console.warn('Auth login() failed', e) }
      try { await ensureSubscribed() } catch (e) { console.warn('Push subscribe failed', e) }

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error', err)
      const serverMsg = err?.response?.data?.error || err?.message || 'Invalid credentials'
      setError(serverMsg)
    } finally {
      setLoading(false)
    }
  }

  // ─── NEW: Google OAuth login ──────────────────────────────────────────────
  const onGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    setError('')
    try {
      const data = await api.post('/auth/google', {
        credential: credentialResponse.credential
      })

      const token = data?.token || data?.accessToken || null
      if (!token) {
        setError('Google login failed: no token returned')
        return
      }

      try { localStorage.setItem('token', token) } catch (e) { console.warn('localStorage write failed', e) }
      try { await login(token) } catch (e) { console.warn('Auth login() failed', e) }
      try { await ensureSubscribed() } catch (e) { console.warn('Push subscribe failed', e) }

      navigate('/dashboard')
    } catch (err) {
      console.error('Google login error', err)
      setError(err?.response?.data?.error || 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const onGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.')
  }

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col md:grid md:grid-cols-2">

      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center items-start px-6 sm:px-10 md:px-14 lg:px-20 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b md:border-b-0 md:border-r border-slate-800/50 md:rounded-3xl"
      >
        <div className="w-full max-w-xl mx-auto md:mx-0">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6"
          >
            Let technology handle the details
          </motion.h2>
          <p className="text-base sm:text-lg text-slate-300 font-medium mb-6 sm:mb-10">
            Live smarter every day — tracking, saving, and staying fresh without even trying.
          </p>

          <div className="space-y-4 sm:space-y-5 text-slate-300 text-sm">
            {[
              { title: '🧠 Smart Tracking', color: 'text-cyan-300', description: 'Track groceries, medicines, cosmetics, and more with intelligent organization.' },
              { title: '⏰ Expiry Alerts', color: 'text-indigo-300', description: 'Get notified before items expire — reduce waste and stay ahead.' },
              { title: '🤖 AI Assistant', color: 'text-purple-300', description: 'Receive smart storage tips and usage suggestions tailored to your shelf.' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/40 shadow-lg hover:shadow-cyan-800/30 transition-all duration-300"
              >
                <h3 className={`${feature.color} font-semibold text-base sm:text-lg mb-1`}>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right panel — login form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-slate-900/60 rounded-xl p-6 sm:p-7 border border-slate-800/50 shadow-xl"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-400 mb-2">Welcome back</h1>
          <p className="text-sm sm:text-base text-slate-500 mb-5">Sign in to your account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300"
              role="alert"
              aria-live="polite"
            >
              {error}
            </motion.div>
          )}

          {/* ✅ Google Sign-In Button */}
          <div className="mb-4">
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-300 py-2.5 text-sm font-medium">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in with Google…
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
                  text="continue_with"
                  width="100%"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-xs text-slate-500 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Email/password form (all unchanged) */}
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
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 pr-16 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                className="text-cyan-400 hover:underline transition"
              >
                Forgot password?
              </button>
              <div className="text-slate-400">
                Need an account?{' '}
                <a className="text-cyan-400 underline hover:text-indigo-400 transition" href="/register" rel="noopener noreferrer">
                  Create
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition duration-300 ${
                loading ? 'cursor-wait opacity-60' : 'hover:bg-indigo-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            By signing in you agree to our{' '}
            <a className="underline hover:text-cyan-400 transition">Terms</a> &amp;{' '}
            <a className="underline hover:text-cyan-400 transition">Privacy</a>.
          </div>
        </motion.div>
      </div>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  )
}



