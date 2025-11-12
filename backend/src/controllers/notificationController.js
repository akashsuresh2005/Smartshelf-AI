// import Notification from '../models/Notification.js'
// import { sendEmail } from '../utils/mailer.js'
// import { sendPushToAll } from '../utils/push.js'

// export async function getAll(req, res, next) {
//   try {
//     const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 })
//     res.json(list)
//   } catch (err) {
//     next(err)
//   }
// }

// export async function markRead(req, res, next) {
//   try {
//     const { id } = req.body
//     const updated = await Notification.findOneAndUpdate(
//       { _id: id, userId: req.user.id },
//       { read: true },
//       { new: true }
//     )
//     res.json(updated)
//   } catch (err) {
//     next(err)
//   }
// }

// /* Example manual trigger (optional) */
// export async function sendTest(req, res, next) {
//   try {
//     await sendEmail(req.user.email, 'Test Notification', 'This is a test email.')
//     await sendPushToAll('Test Push', 'This is a test push message.')
//     res.json({ ok: true })
//   } catch (err) {
//     next(err)
//   }
// }
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/mailer.js';
import { sendPushToAll } from '../utils/push.js';

/**
 * Utility to parse integers safely with defaults and clamps
 */
function toInt(v, def, min = 1, max = 100) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(Math.max(n, min), max);
}

/**
 * NEW: List notifications with filters + pagination
 * GET /api/notifications
 * Query: q, type, status (all|read|unread), from, to (ISO), page, limit, sort=createdAt, order=desc
 */
export async function list(req, res, next) {
  try {
    const {
      q = '',
      type = '',              // 'email' | 'push' | 'system' (system currently unused)
      status = 'all',         // 'all' | 'read' | 'unread'
      from = '',              // ISO date
      to = '',                // ISO date
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const find = { userId: req.user.id };

    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      find.$or = [{ title: rx }, { message: rx }];
    }

    if (type && ['email', 'push', 'system'].includes(type)) {
      // schema supports 'email' and 'push'; 'system' will just return 0 unless you add such docs
      find.type = type;
    }

    if (status === 'read') find.read = true;
    else if (status === 'unread') find.read = false;

    // Date range on createdAt
    if (from || to) {
      find.createdAt = {};
      if (from && !Number.isNaN(new Date(from))) find.createdAt.$gte = new Date(from);
      if (to && !Number.isNaN(new Date(to))) find.createdAt.$lte = new Date(to);
    }

    const pageNum = toInt(page, 1, 1, 100000);
    const perPage = toInt(limit, 20, 1, 100);
    const skip = (pageNum - 1) * perPage;

    const sortField = ['createdAt', 'title', 'type', 'read'].includes(sort) ? sort : 'createdAt';
    const sortDir = order === 'asc' ? 1 : -1;

    const [rows, total] = await Promise.all([
      Notification.find(find).sort({ [sortField]: sortDir }).skip(skip).limit(perPage),
      Notification.countDocuments(find)
    ]);

    res.json({
      items: rows,
      total,
      page: pageNum,
      pages: Math.ceil(total / perPage)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * KEEP (compat): return all (no filters) — legacy
 * GET /api/notifications/get-all
 */
export async function getAll(req, res, next) {
  try {
    const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * KEEP (compat single): mark one as read — legacy
 * POST /api/notifications/mark-read { id }
 */
export async function markRead(req, res, next) {
  try {
    const { id } = req.body;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * NEW: bulk read/unread
 * PATCH /api/notifications/mark
 * body: { ids: string[], read: boolean }
 */
export async function markMany(req, res, next) {
  try {
    const { ids = [], read = true } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids[] required' });
    }
    await Notification.updateMany({ _id: { $in: ids }, userId: req.user.id }, { $set: { read: !!read } });
    res.json({ updated: ids.length, read: !!read });
  } catch (err) {
    next(err);
  }
}

/**
 * NEW: delete notification
 * DELETE /api/notifications/:id
 */
export async function removeOne(req, res, next) {
  try {
    const { id } = req.params;
    const del = await Notification.findOneAndDelete({ _id: id, userId: req.user.id });
    res.json({ deleted: !!del });
  } catch (err) {
    next(err);
  }
}

/**
 * NEW: stats — total + unread count
 * GET /api/notifications/stats
 */
export async function stats(req, res, next) {
  try {
    const [total, unread] = await Promise.all([
      Notification.countDocuments({ userId: req.user.id }),
      Notification.countDocuments({ userId: req.user.id, read: false })
    ]);
    res.json({ total, unread });
  } catch (err) {
    next(err);
  }
}

/**
 * NEW: preferences — stored on User document
 * GET /api/notifications/prefs
 * PUT /api/notifications/prefs
 */
export async function getPrefs(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('notificationPrefs');
    res.json(
      user?.notificationPrefs || {
        emailEnabled: true,
        expiringSoon: true,
        expired: true,
        digestDaily: false,
        digestWeekly: true
      }
    );
  } catch (err) {
    next(err);
  }
}

export async function updatePrefs(req, res, next) {
  try {
    const {
      emailEnabled = true,
      expiringSoon = true,
      expired = true,
      digestDaily = false,
      digestWeekly = true
    } = req.body || {};

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          notificationPrefs: {
            emailEnabled: !!emailEnabled,
            expiringSoon: !!expiringSoon,
            expired: !!expired,
            digestDaily: !!digestDaily,
            digestWeekly: !!digestWeekly
          }
        }
      },
      { new: true, upsert: false }
    ).select('notificationPrefs');

    res.json(user.notificationPrefs);
  } catch (err) {
    next(err);
  }
}

/* Example manual trigger (optional) */
export async function sendTest(req, res, next) {
  try {
    await sendEmail(req.user.email, 'Test Notification', 'This is a test email.');
    await sendPushToAll('Test Push', 'This is a test push message.');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
