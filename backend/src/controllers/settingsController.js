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
 * Accepts: { name, theme, accent, layoutDensity, notificationPrefs, twoFactorEnabled }
 */
export async function updateMe(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id
    if (!id) return res.status(401).json({ error: 'Unauthorized' })

    // whitelist fields that can be updated
    const {
      name,
      theme,
      accent,
      layoutDensity,
      notificationPrefs,
      twoFactorEnabled
    } = req.body

    const update = {}
    if (name !== undefined) update.name = String(name).trim()
    if (theme !== undefined) update.theme = theme
    if (accent !== undefined) update.accent = accent
    if (layoutDensity !== undefined) update.layoutDensity = layoutDensity
    if (notificationPrefs !== undefined) update.notificationPrefs = notificationPrefs
    if (twoFactorEnabled !== undefined) update.twoFactorEnabled = Boolean(twoFactorEnabled)

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
 * Simulated test action: creates an Activity entry and tries to send email/push (best-effort).
 * Returns: { ok: true, emailSent: boolean, pushSent: boolean, message: string }
 */
export async function testNotification(req, res, next) {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    // Keep a record of what succeeded
    let emailSent = false;
    let pushSent = false;
    let emailError = null;
    let pushError = null;

    // Try to fetch full user (to get email, push subscription info etc.)
    let dbUser = null;
    try {
      dbUser = await User.findById(id).select('-password -__v');
    } catch (e) {
      console.warn('testNotification: failed to load user from DB:', e?.message || e);
    }

    // Best-effort: try sending email if mailer exists and user has an email
    if (dbUser?.email) {
      try {
        // dynamic import so missing mailer util won't crash server
        const mailer = await import('../utils/mailer.js').catch(() => null);
        const sendEmail = mailer?.sendEmail ?? mailer?.default?.sendEmail;
        if (typeof sendEmail === 'function') {
          // Customize subject/body as you like (kept minimal & safe)
          const subject = 'SmartShelf — Test notification';
          const text = `This is a test notification triggered by user ${dbUser.name || dbUser.email}. If you received this, email sending works.`;
          // sendEmail should be implemented to accept (to, subject, text, html?) — adapt if your signature differs
          await sendEmail(dbUser.email, subject, text).catch((e) => { throw e; });
          emailSent = true;
        } else {
          // mailer not implemented; skip
          emailSent = false;
        }
      } catch (e) {
        emailError = e?.message || String(e);
        console.warn('testNotification: email send failed', emailError);
      }
    }

    // Best-effort: try sending push notification if push util exists
    try {
      const pushUtil = await import('../utils/push.js').catch(() => null);
      const sendPushToUser = pushUtil?.sendPushToUser ?? pushUtil?.default?.sendPushToUser;
      if (typeof sendPushToUser === 'function') {
        // Example payload; adapt to your push util expectations
        const payload = {
          title: 'SmartShelf — Test notification',
          body: `Hello ${dbUser?.name || 'user'}, this is a test notification.`,
          data: { test: true }
        };
        // sendPushToUser should accept (userId, payload) or similar — adapt if needed
        await sendPushToUser(id.toString(), payload).catch((e) => { throw e; });
        pushSent = true;
      } else {
        pushSent = false;
      }
    } catch (e) {
      pushError = e?.message || String(e);
      console.warn('testNotification: push send failed', pushError);
    }

    // Log Activity (best-effort)
    try {
      await Activity.create({
        userId: id.toString(),
        userName: req.user?.name || dbUser?.name || null,
        type: 'notification:test',
        message: 'Test notification triggered',
        meta: {
          test: true,
          triggeredAt: new Date(),
          emailSent,
          pushSent,
          emailError,
          pushError
        }
      });
    } catch (e) {
      // non-fatal
      console.warn('testNotification: activity logging failed', e?.message || e);
    }

    // Return a clear response the frontend can use
    return res.json({
      ok: true,
      emailSent,
      pushSent,
      message: emailSent || pushSent
        ? 'Test notification sent (best-effort).'
        : 'Test recorded (no email/push available).',
      details: { emailError, pushError }
    });
  } catch (err) {
    // unexpected error — forward to express error handler
    next(err);
  }
}
