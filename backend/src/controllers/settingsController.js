// backend/src/controllers/settingsController.js
import fs from 'fs'
import path from 'path'
import User from '../models/User.js'
import Activity from '../models/Activity.js'

/**
 * GET /api/users/me
 */
export async function getMe(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id
    if (!id) return res.status(401).json({ error: 'Unauthorized' })
    const u = await User.findById(id).select('-password -__v')
    if (!u) return res.status(404).json({ error: 'User not found' })
    res.json(u)
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/users/me
 * Accepts: { name, theme, accent, layoutDensity, notificationPrefs }
 */
export async function updateMe(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id
    if (!id) return res.status(401).json({ error: 'Unauthorized' })

    // whitelist fields that can be updated
    const { name, theme, accent, layoutDensity, notificationPrefs } = req.body
    const update = {}
    if (name !== undefined) update.name = String(name).trim()
    if (theme !== undefined) update.theme = theme
    if (accent !== undefined) update.accent = accent
    if (layoutDensity !== undefined) update.layoutDensity = layoutDensity
    if (notificationPrefs !== undefined) update.notificationPrefs = notificationPrefs

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).select('-password -__v')

    // log activity for name change
    try {
      if (update.name) {
        await Activity.create({
          userId: id.toString(),
          userName: user.name,
          type: 'auth:update_profile',
          message: `Profile updated`,
          meta: { changed: Object.keys(update) }
        })
      }
    } catch (e) { /* ignore logging errors */ }

    res.json(user)
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/users/me/password
 * Body: { currentPassword, newPassword }
 */
export async function changePassword(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id
    if (!id) return res.status(401).json({ error: 'Unauthorized' })
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' })

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const ok = await user.comparePassword(currentPassword)
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' })

    user.password = newPassword
    await user.save()

    try {
      await Activity.create({
        userId: id.toString(),
        userName: user.name,
        type: 'auth:password_change',
        message: 'Password changed'
      })
    } catch (e) {}

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/users/me/avatar
 * multer should populate req.file
 */
export async function uploadAvatar(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id
    if (!id) return res.status(401).json({ error: 'Unauthorized' })

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    // generate accessible URL path (adjust if your static folder / base differs)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    const user = await User.findByIdAndUpdate(id, { $set: { avatarUrl } }, { new: true }).select('-password -__v')

    try {
      await Activity.create({
        userId: id.toString(),
        userName: user.name,
        type: 'auth:avatar_upload',
        message: 'Avatar uploaded',
        meta: { avatarUrl }
      })
    } catch (e) {}

    res.json({ success: true, avatarUrl })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/users/me/avatar
 */
export async function removeAvatar(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id
    if (!id) return res.status(401).json({ error: 'Unauthorized' })
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const avatarUrl = user.avatarUrl
    user.avatarUrl = undefined
    await user.save()
    // also delete file on disk if it exists AND you stored it locally
    if (avatarUrl && avatarUrl.startsWith('/uploads/avatars/')) {
      const filepath = path.resolve(process.cwd(), 'public', avatarUrl.replace(/^\//, ''))
      fs.unlink(filepath, (err) => { /* ignore fs errors */ })
    }
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/users/me/revoke-sessions
 * Simple approach: set sessionsRevokedAt on user
 */
export async function revokeSessions(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id
    if (!id) return res.status(401).json({ error: 'Unauthorized' })
    const now = new Date()
    await User.findByIdAndUpdate(id, { $set: { sessionsRevokedAt: now } })

    try {
      await Activity.create({
        userId: id.toString(),
        userName: req.user?.name || null,
        type: 'auth:revoke_sessions',
        message: 'Revoked sessions',
        meta: { revokedAt: now }
      })
    } catch (e) {}
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/users/me/test
 * Simulated test action: creates an Activity entry for testing.
 */
export async function testNotification(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    // Simple simulated test: create a notification activity entry (best-effort)
    try {
      await Activity.create({
        userId: id.toString(),
        userName: req.user?.name || null,
        type: 'mail:sent',
        message: `Test notification triggered`,
        meta: { test: true, triggeredAt: new Date() }
      });
    } catch (e) {
      console.warn('testNotification: activity logging failed', e?.message || e);
    }

    res.json({ ok: true, message: 'Test notification recorded (server-side).' });
  } catch (err) {
    next(err);
  }
}
