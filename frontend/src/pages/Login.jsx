// // src/pages/Login.jsx
// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext.jsx'
// import api from '../utils/api.js'
// import ForgotPasswordModal from './ForgotPasswordModal.jsx'

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
//       const { data } = await api.post('/auth/login', { email, password })

//       if (data?.token) {
//         localStorage.setItem('token', data.token)
//       }

//       login(data.token)
//       navigate('/dashboard')
//     } catch (err) {
//       console.error(err.response?.data || err.message)
//       setError(err.response?.data?.error || 'Invalid credentials')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.32 }}
//         className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
//       >
//         {/* Illustration / branding */}
//         <div className="hidden md:flex flex-col items-center justify-center p-8 rounded-xl bg-slate-900/60 border border-slate-800/50">
//           <div className="mb-4">
//            <img src="/assets/logo2.png" alt="Smart Shelf Logo" />

//           </div>
//           <h2 className="text-3xl font-bold text-cyan-400">Smart Shelf</h2>
//           <p className="mt-3 text-base text-slate-400 text-center px-8">
//             Track expiry dates — get reminders, reduce food waste and save money. Fast, private, and simple.
//           </p>
//         </div>

//         {/* Form card */}
//         <div className="bg-slate-900/60 rounded-lg p-7 border border-slate-800/50">
//           <h1 className="text-3xl font-semibold text-cyan-400 mb-2">Welcome back</h1>
//           <p className="text-base text-slate-500 mb-4">Sign in to your account</p>

//           {error && (
//             <div
//               role="alert"
//               aria-live="polite"
//               className="mb-3 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300"
//             >
//               {error}
//             </div>
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
//                 className="text-cyan-400 hover:underline"
//               >
//                 Forgot password?
//               </button>
//               <div className="text-slate-400">
//                 Need an account?{' '}
//                 <a className="text-cyan-400 underline" href="/register" rel="noopener noreferrer">
//                   Create
//                 </a>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition disabled:opacity-60 ${
//                   loading ? 'cursor-wait' : 'hover:bg-indigo-500'
//                 }`}
//               >
//                 {loading ? 'Signing in...' : 'Sign in'}
//               </button>
//             </div>
//           </form>

//           <div className="mt-4 text-center text-xs text-slate-500">
//             By signing in you agree to our <a className="underline">Terms</a> & <a className="underline">Privacy</a>.
//           </div>
//         </div>
//       </motion.div>

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

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // NOTE: your api instance returns res.data directly (see src/utils/api.js)
      const data = await api.post('/auth/login', { email, password })

      // If backend returned an error payload (sometimes 200 + { error: '...' })
      if (data?.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      // Extract token (support token or accessToken keys)
      const token = data?.token || data?.accessToken || null
      if (!token) {
        setError('Login failed: no token returned')
        setLoading(false)
        return
      }

      // Save token safely
      try { localStorage.setItem('token', token) } catch (e) { console.warn('localStorage write failed', e) }

      // Update auth context / user state
      try { await login(token) } catch (e) { console.warn('Auth login() failed', e) }

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error', err)
      // err.response?.data may exist if axios error; otherwise fallback
      const serverMsg = err?.response?.data?.error || err?.message || 'Invalid credentials'
      setError(serverMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left half - expanded left only */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center items-start px-20 py-10 ml-[-40px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-800/50 rounded-3xl"
      >
        <div className="max-w-2xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-5xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6"
          >
            Let technology handle the details
          </motion.h2>
          <p className="text-lg text-slate-300 font-medium mb-10">
            Live smarter every day — tracking, saving, and staying fresh without even trying.
          </p>

          <div className="space-y-5 text-slate-300 text-sm">
            {[
              {
                title: '🧠 Smart Tracking',
                color: 'text-cyan-300',
                description: 'Track groceries, medicines, cosmetics, and more with intelligent organization.',
              },
              {
                title: '⏰ Expiry Alerts',
                color: 'text-indigo-300',
                description: 'Get notified before items expire — reduce waste and stay ahead.',
              },
              {
                title: '🤖 AI Assistant',
                color: 'text-purple-300',
                description: 'Receive smart storage tips and usage suggestions tailored to your shelf.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40 shadow-lg hover:shadow-cyan-800/30 transition-all duration-300"
              >
                <h3 className={`${feature.color} font-semibold text-lg mb-1`}>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right half - login form centered */}
      <div className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-slate-900/60 rounded-xl p-7 border border-slate-800/50 shadow-xl"
        >
          <h1 className="text-3xl font-semibold text-cyan-400 mb-2">Welcome back</h1>
          <p className="text-base text-slate-500 mb-4">Sign in to your account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 rounded-md bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300"
              role="alert"
              aria-live="polite"
            >
              {error}
            </motion.div>
          )}

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
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 pr-16 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium shadow transition duration-300 ${
                  loading ? 'cursor-wait opacity-60' : 'hover:bg-indigo-500'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            By signing in you agree to our <a className="underline hover:text-cyan-400 transition">Terms</a> & <a className="underline hover:text-cyan-400 transition">Privacy</a>.
          </div>
        </motion.div>
      </div>

      {/* Forgot password modal */}
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  )
}




