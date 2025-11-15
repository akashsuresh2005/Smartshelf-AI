// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendEmail } from '../utils/mailer.js'
import crypto from 'crypto'
import Activity from '../models/Activity.js'
import { makeActivityPayload } from '../utils/activityHelper.js'

// signToken used for auth tokens
const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })

// In-memory reset token store (demo only) — keep in module scope so both functions use the same map
export const resetTokens = new Map()

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already used' })
    const user = await User.create({ name, email, password })
    const token = signToken(user)

    // log activity (standardized)
    try {
      const payload = makeActivityPayload({
        type: 'auth:signup',
        message: `User signed up (${user.email})`,
        meta: { email: user.email },
        userId: user._id.toString(),
        userName: user.name
      })
      await Activity.create(payload)
    } catch (e) { /* ignore logging errors */ }

    res.json({ message: 'Signup successful', token })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken(user)

    // log activity
    try {
      const payload = makeActivityPayload({
        type: 'auth:login',
        message: `User logged in (${user.email})`,
        meta: { email: user.email },
        userId: user._id.toString(),
        userName: user.name
      })
      await Activity.create(payload)
    } catch (e) { /* ignore */ }

    res.json({ message: 'Login successful', token })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res) {
  try {
    const { userId, userName } = req.body || {}
    if (userId) {
      try {
        const payload = makeActivityPayload({
          type: 'auth:logout',
          message: `User logged out (${userName || userId})`,
          meta: { userId, userName },
          userId,
          userName: userName || 'Unknown'
        })
        await Activity.create(payload)
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
  res.json({ message: 'Logged out' })
}

/**
 * forgotPassword(req): generate a short token, store in resetTokens, email link.
 * note: resetTokens map is in-module (not persisted). It's fine for demo.
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const user = await User.findOne({ email })
    if (!user) {
      // respond success to avoid enumeration
      return res.json({ message: 'If that email exists, we sent a reset link.' })
    }

    const token = crypto.randomBytes(24).toString('hex')
    const expiresAt = Date.now() + 1000 * 60 * 60 // 1 hour
    resetTokens.set(token, { userId: user._id.toString(), expiresAt })

    const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
    const resetUrl = `${frontend}/reset-password?token=${token}`

    try {
      await sendEmail(user.email, 'Reset your Smart Shelf password', `Click to reset: ${resetUrl}\n\nIf you did not request this, ignore.`)

      try {
        const payload = makeActivityPayload({
          type: 'mail:sent',
          message: `Password reset link sent to ${user.email}`,
          meta: { resetToken: token, to: user.email, subject: 'Reset your Smart Shelf password' },
          userId: user._id.toString(),
          userName: user.name
        })
        await Activity.create(payload)
      } catch (e) {}
    } catch (e) {
      try {
        const payload = makeActivityPayload({
          type: 'mail:attempt',
          message: `Attempted reset email for ${user.email} (mailer failed)`,
          meta: { err: String(e?.message || e), to: user.email },
          userId: user._id.toString(),
          userName: user.name
        })
        await Activity.create(payload)
      } catch (ee) {}
    }

    return res.json({ message: 'If that email exists, we sent a reset link.' })
  } catch (err) {
    next(err)
  }
}

/**
 * resetPassword(req): expects { token, password } where token is the random token created above.
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Missing token or password' })

    const entry = resetTokens.get(token)
    if (!entry) return res.status(400).json({ error: 'Invalid or expired token' })
    if (Date.now() > entry.expiresAt) {
      resetTokens.delete(token)
      return res.status(400).json({ error: 'Expired token' })
    }

    const user = await User.findById(entry.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.password = password
    await user.save()

    // remove token to prevent reuse
    resetTokens.delete(token)

    try {
      const payload = makeActivityPayload({
        type: 'auth:reset',
        message: `Password reset for ${user.email}`,
        meta: { userId: user._id.toString() },
        userId: user._id.toString(),
        userName: user.name
      })
      await Activity.create(payload)
    } catch (e) {}

    res.json({ success: true, message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}
