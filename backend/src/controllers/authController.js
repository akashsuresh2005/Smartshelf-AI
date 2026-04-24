// // backend/src/controllers/authController.js
// import jwt from 'jsonwebtoken'
// import User from '../models/User.js'
// import { sendEmail } from '../utils/mailer.js'
// import crypto from 'crypto'
// import Activity from '../models/Activity.js'
// import { makeActivityPayload } from '../utils/activityHelper.js'

// // signToken used for auth tokens
// const signToken = (user) =>
//   jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })

// // In-memory reset token store (demo only) — keep in module scope so both functions use the same map
// export const resetTokens = new Map()

// export async function signup(req, res, next) {
//   try {
//     const { name, email, password } = req.body
//     if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
//     const exists = await User.findOne({ email })
//     if (exists) return res.status(400).json({ error: 'Email already used' })
//     const user = await User.create({ name, email, password })
//     const token = signToken(user)

//     // log activity (standardized)
//     try {
//       const payload = makeActivityPayload({
//         type: 'auth:signup',
//         message: `User signed up (${user.email})`,
//         meta: { email: user.email },
//         userId: user._id.toString(),
//         userName: user.name
//       })
//       await Activity.create(payload)
//     } catch (e) { /* ignore logging errors */ }

//     res.json({ message: 'Signup successful', token })
//   } catch (err) {
//     next(err)
//   }
// }

// export async function login(req, res, next) {
//   try {
//     const { email, password } = req.body
//     const user = await User.findOne({ email })
//     if (!user) return res.status(401).json({ error: 'Invalid credentials' })
//     const ok = await user.comparePassword(password)
//     if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
//     const token = signToken(user)

//     // log activity
//     try {
//       const payload = makeActivityPayload({
//         type: 'auth:login',
//         message: `User logged in (${user.email})`,
//         meta: { email: user.email },
//         userId: user._id.toString(),
//         userName: user.name
//       })
//       await Activity.create(payload)
//     } catch (e) { /* ignore */ }

//     res.json({ message: 'Login successful', token })
//   } catch (err) {
//     next(err)
//   }
// }

// export async function logout(req, res) {
//   try {
//     const { userId, userName } = req.body || {}
//     if (userId) {
//       try {
//         const payload = makeActivityPayload({
//           type: 'auth:logout',
//           message: `User logged out (${userName || userId})`,
//           meta: { userId, userName },
//           userId,
//           userName: userName || 'Unknown'
//         })
//         await Activity.create(payload)
//       } catch (e) { /* ignore */ }
//     }
//   } catch (e) { /* ignore */ }
//   res.json({ message: 'Logged out' })
// }

// /**
//  * forgotPassword(req): generate a short token, store in resetTokens, email link.
//  * note: resetTokens map is in-module (not persisted). It's fine for demo.
//  */
// export async function forgotPassword(req, res, next) {
//   try {
//     const { email } = req.body
//     if (!email) return res.status(400).json({ error: 'Email required' })

//     const user = await User.findOne({ email })
//     if (!user) {
//       // respond success to avoid enumeration
//       return res.json({ message: 'If that email exists, we sent a reset link.' })
//     }

//     const token = crypto.randomBytes(24).toString('hex')
//     const expiresAt = Date.now() + 1000 * 60 * 60 // 1 hour
//     resetTokens.set(token, { userId: user._id.toString(), expiresAt })

//     const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
//     const resetUrl = `${frontend}/reset-password?token=${token}`

//     try {
//       await sendEmail(user.email, 'Reset your Smart Shelf password', `Click to reset: ${resetUrl}\n\nIf you did not request this, ignore.`)

//       try {
//         const payload = makeActivityPayload({
//           type: 'mail:sent',
//           message: `Password reset link sent to ${user.email}`,
//           meta: { resetToken: token, to: user.email, subject: 'Reset your Smart Shelf password' },
//           userId: user._id.toString(),
//           userName: user.name
//         })
//         await Activity.create(payload)
//       } catch (e) {}
//     } catch (e) {
//       try {
//         const payload = makeActivityPayload({
//           type: 'mail:attempt',
//           message: `Attempted reset email for ${user.email} (mailer failed)`,
//           meta: { err: String(e?.message || e), to: user.email },
//           userId: user._id.toString(),
//           userName: user.name
//         })
//         await Activity.create(payload)
//       } catch (ee) {}
//     }

//     return res.json({ message: 'If that email exists, we sent a reset link.' })
//   } catch (err) {
//     next(err)
//   }
// }

// /**
//  * resetPassword(req): expects { token, password } where token is the random token created above.
//  */
// export async function resetPassword(req, res, next) {
//   try {
//     const { token, password } = req.body
//     if (!token || !password) return res.status(400).json({ error: 'Missing token or password' })

//     const entry = resetTokens.get(token)
//     if (!entry) return res.status(400).json({ error: 'Invalid or expired token' })
//     if (Date.now() > entry.expiresAt) {
//       resetTokens.delete(token)
//       return res.status(400).json({ error: 'Expired token' })
//     }

//     const user = await User.findById(entry.userId)
//     if (!user) return res.status(404).json({ error: 'User not found' })

//     user.password = password
//     await user.save()

//     // remove token to prevent reuse
//     resetTokens.delete(token)

//     try {
//       const payload = makeActivityPayload({
//         type: 'auth:reset',
//         message: `Password reset for ${user.email}`,
//         meta: { userId: user._id.toString() },
//         userId: user._id.toString(),
//         userName: user.name
//       })
//       await Activity.create(payload)
//     } catch (e) {}

//     res.json({ success: true, message: 'Password updated' })
//   } catch (err) {
//     next(err)
//   }
// }
// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import Activity from '../models/Activity.js'
import { sendEmail, sendPasswordResetEmail } from '../utils/mailer.js'
import { makeActivityPayload } from '../utils/activityHelper.js'

// ─── Google OAuth client ──────────────────────────────────────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ─── JWT helper ───────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

// ─── In-memory reset token store ─────────────────────────────────────────────
// Resets on server restart — acceptable for demo. Use DB tokens for production.
export const resetTokens = new Map()

// ─── Activity log helper (fire and forget, never throws) ─────────────────────
async function logAct(opts) {
  try {
    const payload = makeActivityPayload(opts)
    await Activity.create(payload)
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────────────────────────────────────
export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Missing fields' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already used' })

    const user = await User.create({ name, email, password })
    const token = signToken(user)

    await logAct({
      type: 'auth:signup',
      message: `User signed up (${user.email})`,
      meta: { email: user.email },
      userId: user._id.toString(),
      userName: user.name
    })

    res.json({ message: 'Signup successful', token })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    // Google-only account trying password login
    if (!user.password) {
      return res.status(401).json({
        error: 'This account uses Google sign-in. Please click "Continue with Google".'
      })
    }

    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user)

    await logAct({
      type: 'auth:login',
      message: `User logged in (${user.email})`,
      meta: { email: user.email },
      userId: user._id.toString(),
      userName: user.name
    })

    res.json({ message: 'Login successful', token })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(req, res) {
  try {
    const { userId, userName } = req.body || {}
    if (userId) {
      await logAct({
        type: 'auth:logout',
        message: `User logged out (${userName || userId})`,
        meta: { userId, userName },
        userId,
        userName: userName || 'Unknown'
      })
    }
  } catch (_) {}
  res.json({ message: 'Logged out' })
}

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    // Same message always — prevents email enumeration
    const successMsg = 'If that email exists, a reset link was sent. Check your inbox and spam folder.'

    const user = await User.findOne({ email })
    if (!user) return res.json({ message: successMsg })

    // Generate a secure random token (48 hex chars = 192 bits)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour

    resetTokens.set(token, { userId: user._id.toString(), expiresAt })

    const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
    const resetUrl = `${frontend}/reset-password?token=${token}`

    try {
      await sendPasswordResetEmail(user.email, resetUrl)

      await logAct({
        type: 'mail:sent',
        message: `Password reset email sent to ${user.email}`,
        meta: { to: user.email },
        userId: user._id.toString(),
        userName: user.name
      })
    } catch (emailErr) {
      console.error('[forgotPassword] Email failed:', emailErr?.message)
      // Remove the token since we couldn't send the email
      resetTokens.delete(token)
      await logAct({
        type: 'mail:failed',
        message: `Reset email failed for ${user.email}`,
        meta: { error: emailErr?.message },
        userId: user._id.toString(),
        userName: user.name
      })
      return res.status(500).json({
        error: 'Failed to send reset email. Please check server email configuration.'
      })
    }

    return res.json({ message: successMsg })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body
    if (!token || !password)
      return res.status(400).json({ error: 'Token and new password are required' })

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const entry = resetTokens.get(token)
    if (!entry)
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' })

    if (Date.now() > entry.expiresAt) {
      resetTokens.delete(token)
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' })
    }

    const user = await User.findById(entry.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Update password — pre-save hook will hash it
    user.password = password
    await user.save()

    // Invalidate token so it can't be reused
    resetTokens.delete(token)

    await logAct({
      type: 'auth:reset',
      message: `Password reset completed for ${user.email}`,
      meta: { userId: user._id.toString() },
      userId: user._id.toString(),
      userName: user.name
    })

    // Confirmation email (non-critical — don't fail if it errors)
    try {
      await sendEmail(
        user.email,
        'SmartShelf — your password was changed',
        `Hi ${user.name},\n\nYour SmartShelf password was successfully changed.\n\nIf you did not do this, please contact support immediately.`
      )
    } catch (_) {}

    res.json({ success: true, message: 'Password updated successfully. You can now sign in.' })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE AUTH
// ─────────────────────────────────────────────────────────────────────────────
export async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body
    if (!credential)
      return res.status(400).json({ error: 'Google credential is required' })

    // Verify the Google ID token with Google's servers
    let ticket
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      })
    } catch (e) {
      console.error('[googleAuth] Token verification failed:', e.message)
      return res.status(401).json({ error: 'Invalid Google token. Please try again.' })
    }

    const { email, name, sub: googleId, picture } = ticket.getPayload()
    if (!email)
      return res.status(400).json({ error: 'Google account has no email address' })

    // Find by googleId first, then fall back to email
    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (!user) {
      // New user — create account
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatarUrl: picture || undefined,
        // Set a random unusable password so the field isn't empty
        password: crypto.randomBytes(24).toString('hex')
      })

      await logAct({
        type: 'auth:signup',
        message: `New user signed up via Google (${user.email})`,
        meta: { email: user.email, provider: 'google' },
        userId: user._id.toString(),
        userName: user.name
      })
    } else {
      // Existing user — link googleId and/or avatar if not already set
      const updates = {}
      if (!user.googleId) updates.googleId = googleId
      if (picture && !user.avatarUrl) updates.avatarUrl = picture

      if (Object.keys(updates).length > 0) {
        // Use findByIdAndUpdate to bypass the pre-save password hook
        await User.findByIdAndUpdate(user._id, { $set: updates }, { new: false })
        user = await User.findById(user._id)
      }
    }

    const token = signToken(user)

    await logAct({
      type: 'auth:login',
      message: `User logged in via Google (${user.email})`,
      meta: { email: user.email, provider: 'google' },
      userId: user._id.toString(),
      userName: user.name
    })

    res.json({ message: 'Google login successful', token })
  } catch (err) {
    next(err)
  }
}