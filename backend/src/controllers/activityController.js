// backend/src/controllers/activityController.js
import Activity from '../models/Activity.js'
import { makeActivityPayload } from '../utils/activityHelper.js'

export async function createActivity(req, res, next) {
  try {
    // allow callers to pass full minimal payload; we will normalize
    const { userId, userName, type, message, meta, createdAt } = req.body
    if (!type || !message) return res.status(400).json({ error: 'Missing fields: type and message required' })

    const payload = makeActivityPayload({ type, message, meta, userId, userName, createdAt })
    // If createdAt is passed by client, allow it; otherwise rely on timestamps
    const a = await Activity.create(payload)
    res.json({ success: true, activity: a })
  } catch (err) {
    next(err)
  }
}

export async function listActivities(req, res, next) {
  try {
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10) || 50)
    const userId = req.query.userId
    const filter = userId ? { userId } : {}
    // return newest first
    const items = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit)
    res.json(items)
  } catch (err) {
    next(err)
  }
}

