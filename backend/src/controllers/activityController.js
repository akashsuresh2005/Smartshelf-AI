// backend/src/controllers/activityController.js
import Activity from '../models/Activity.js'
import { makeActivityPayload } from '../utils/activityHelper.js'

export async function createActivity(req, res, next) {
  try {
    // require auth - only allow creating activity for the current user
    const authUserId = req.user?.id;
    if (!authUserId) return res.status(401).json({ error: 'Unauthorized' });

    // allow callers to pass minimal payload; we will normalize and enforce userId
    const { type, message, meta, createdAt } = req.body;
    if (!type || !message) return res.status(400).json({ error: 'Missing fields: type and message required' });

    // prefer server-derived user identity, fallback to userName provided (non-trusted)
    const userName = req.user?.name || req.body.userName || req.user?.email || null;

    const payload = makeActivityPayload({
      type,
      message,
      meta,
      userId: authUserId, // enforce the authenticated user id
      userName,
      createdAt
    });

    // If createdAt is passed, makeActivityPayload may accept it; otherwise mongoose timestamps apply
    const a = await Activity.create(payload);
    res.json({ success: true, activity: a });
  } catch (err) {
    next(err);
  }
}

export async function listActivities(req, res, next) {
  try {
    // defensive limit
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10) || 50);

    // MUST use authenticated user id; do not allow arbitrary userId in query to avoid leaking other users' activities
    const authUserId = req.user?.id;
    if (!authUserId) return res.status(401).json({ error: 'Unauthorized' });

    // Build filter: always scope by authenticated user.
    const filter = { userId: String(authUserId) };

    // Optional: support a query param like ?type=item:add to filter by type (safe)
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Query and return results (newest first)
    const items = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit).lean().exec();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

