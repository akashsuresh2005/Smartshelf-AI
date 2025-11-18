// backend/src/controllers/reminderController.js
import mongoose from 'mongoose'
import Item from '../models/Item.js'

/**
 * GET /reminders
 * Returns an array of upcoming reminders for the authenticated user.
 * Minimal payload (only the fields you requested):
 * [
 *   { _id, itemId, name, category, date }
 * ]
 *
 * Behavior:
 * - Prefer explicit `reminderTime` on the Item (if present).
 * - Otherwise include items with expiryDate within windowDays (default 7).
 * - Excludes items with status 'consumed'.
 */
export async function getUpcomingReminders(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })

    const userId = new mongoose.Types.ObjectId(req.user.id)
    const now = new Date()
    const windowDays = Number(process.env.REMINDER_WINDOW_DAYS || 7)
    const inWindow = new Date(Date.now() + windowDays * 24 * 60 * 60 * 1000)

    // Find items with either a reminderTime (any) or expiryDate within the window.
    const items = await Item.find({
      userId,
      status: { $ne: 'consumed' },
      $or: [
        { reminderTime: { $exists: true, $ne: null } },
        { expiryDate: { $gte: now, $lte: inWindow } }
      ]
    })
      .sort({ reminderTime: 1, expiryDate: 1 })
      .lean()

    // Map to minimal reminder objects
    const reminders = items.map(it => {
      const dateObj = it.reminderTime ? new Date(it.reminderTime) : (it.expiryDate ? new Date(it.expiryDate) : null)
      return {
        _id: it._id,
        itemId: it._id,
        name: it.name || 'Item',
        // keep category and a single date string only
        category: it.category || 'other',
        date: dateObj ? dateObj.toISOString() : null,
        // also include title for backward compatibility (same as name)
        title: it.name || 'Item'
      }
    })

    // Return minimal array only — no extra metadata
    return res.json(reminders)
  } catch (err) {
    return next(err)
  }
}
