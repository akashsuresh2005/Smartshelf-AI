import mongoose from 'mongoose'
import Item from '../models/Item.js'
import Notification from '../models/Notification.js'
import { sendEmail } from '../utils/mailer.js'
import { sendPushToUser } from '../utils/push.js'
import { getRecipientEmail } from '../utils/notify.js'
import Activity from '../models/Activity.js'
import { makeActivityPayload } from '../utils/activityHelper.js'

const daysBetween = (a, b) => Math.ceil((b - a) / (1000 * 60 * 60 * 24))

const ALLOWED = new Set(['grocery', 'medicine', 'cosmetic', 'beverage', 'other'])
const normalizeCategory = (c) => {
  const v = (c || '').toString().trim().toLowerCase()
  if (!v) return 'grocery'
  const map = { groceries: 'grocery', medicines: 'medicine', cosmetics: 'cosmetic', beverages: 'beverage', others: 'other' }
  const m = map[v]
  if (m) return m
  return ALLOWED.has(v) ? v : 'grocery'
}

const toDate = (v) => {
  if (v === undefined || v === null || v === '') return undefined
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? undefined : d
}
const toNum = (v) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

/**
 * Build detailed email content when an item is added.
 */
function buildItemAddedEmail(item) {
  const now = new Date()
  const expiry = item.expiryDate ? new Date(item.expiryDate) : null
  const created = item.createdAt ? new Date(item.createdAt) : null
  const diffDays = expiry ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : null

  const subject = `SmartShelf – "${item.name}" has been added`

  const textBody = `
Your item "${item.name}" has been added to SmartShelf.

Item details:
- Name       : ${item.name}
- Category   : ${item.category || 'N/A'}
- Quantity   : ${item.quantity ?? 'N/A'}
- Location   : ${item.location || 'N/A'}
- Added on   : ${created ? created.toLocaleDateString() : 'N/A'}
- Expiry date: ${expiry ? expiry.toLocaleDateString() : 'N/A'}
- Days left  : ${diffDays != null ? (diffDays < 0 ? 'Already expired' : diffDays) : 'N/A'}

You will receive reminder emails before this item expires.

— SmartShelf AI
  `.trim()

  const htmlBody = `
    <h2>✅ Item added to SmartShelf</h2>
    <p>Your item <strong>${item.name}</strong> has been added.</p>

    <h3>Item details</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${item.name}</td></tr>
      <tr><td><strong>Category</strong></td><td>${item.category || 'N/A'}</td></tr>
      <tr><td><strong>Quantity</strong></td><td>${item.quantity ?? 'N/A'}</td></tr>
      <tr><td><strong>Location</strong></td><td>${item.location || 'N/A'}</td></tr>
      <tr><td><strong>Added on</strong></td><td>${created ? created.toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td><strong>Expiry date</strong></td><td>${expiry ? expiry.toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td><strong>Days left</strong></td><td>${diffDays != null ? (diffDays < 0 ? 'Already expired' : diffDays) : 'N/A'}</td></tr>
    </table>

    <p style="margin-top:16px;font-size:12px;color:#666;">
      You will receive reminder emails before this item expires.<br/>
      — SmartShelf AI
    </p>
  `

  return { subject, textBody, htmlBody }
}

/**
 * Build detailed email content for an expiring item (same style as cron).
 */
function buildExpiryEmailDetails(item) {
  const now = new Date()
  const expiry = new Date(item.expiryDate)
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

  let suggestion
  if (diffDays < 0) {
    suggestion = 'This item is already expired. Please discard it safely.'
  } else if (diffDays === 0) {
    suggestion = 'Use this item today or discard it if it looks or smells unusual.'
  } else if (diffDays <= 2) {
    suggestion = 'Plan a meal in the next 1–2 days that uses this item so it does not go to waste.'
  } else {
    suggestion = 'Keep this item near the front of your shelf so you remember to use it soon.'
  }

  const subject = `SmartShelf – ${item.name} expires in ${diffDays} day(s)`

  const textBody = `
Your item "${item.name}" is expiring soon.

Item details:
- Name       : ${item.name}
- Category   : ${item.category || 'N/A'}
- Quantity   : ${item.quantity ?? 'N/A'}
- Location   : ${item.location || 'N/A'}
- Added on   : ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
- Expiry date: ${expiry.toLocaleDateString()}
- Days left  : ${diffDays < 0 ? 'Already expired' : diffDays}

Suggestion:
${suggestion}

This reminder was sent by SmartShelf so you can reduce food waste and save money.
  `.trim()

  const htmlBody = `
    <h2>🕒 Item expiring soon</h2>
    <p>Your item <strong>${item.name}</strong> is close to its expiry date.</p>

    <h3>Item details</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${item.name}</td></tr>
      <tr><td><strong>Category</strong></td><td>${item.category || 'N/A'}</td></tr>
      <tr><td><strong>Quantity</strong></td><td>${item.quantity ?? 'N/A'}</td></tr>
      <tr><td><strong>Location</strong></td><td>${item.location || 'N/A'}</td></tr>
      <tr><td><strong>Added on</strong></td><td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td><strong>Expiry date</strong></td><td>${expiry.toLocaleDateString()}</td></tr>
      <tr><td><strong>Days left</strong></td><td>${diffDays < 0 ? 'Already expired' : diffDays}</td></tr>
    </table>

    <h3>Suggestion 💡</h3>
    <p>${suggestion}</p>

    <p style="margin-top:16px;font-size:12px;color:#666;">
      — SmartShelf AI • Helping you track what’s in your shelf
    </p>
  `

  return { subject, textBody, htmlBody }
}

export async function addItem(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })

    const name = (req.body?.name || '').toString().trim()
    const category = normalizeCategory(req.body?.category)
    const expiryDate = toDate(req.body?.expiryDate)

    if (!name) return res.status(400).json({ error: 'Name is required' })
    if (!expiryDate) return res.status(400).json({ error: 'Valid expiryDate is required (YYYY-MM-DD)' })

    const payload = {
      userId: req.user.id,
      name,
      category,
      dosage: req.body?.dosage,
      expiryDate,
      reminderTime: toDate(req.body?.reminderTime),
      barcode: (req.body?.barcode || '').toString().trim() || undefined,
      estimatedCost: toNum(req.body?.estimatedCost),
      brand: (req.body?.brand || '').toString().trim() || undefined,
      quantity: toNum(req.body?.quantity),
      unit: req.body?.unit || 'pcs',
      location: req.body?.location || 'pantry',
      notes: (req.body?.notes || '').toString().trim() || undefined,
      purchaseDate: toDate(req.body?.purchaseDate),
      openedAt: toDate(req.body?.openedAt)
    }

    const item = await Item.create(payload)

    // Log activity: compose standardized payload and persist (non-fatal)
    try {
      const activityPayload = makeActivityPayload({
        type: 'item:add',
        message: `${item.name} added`,
        meta: { item: item },
        userId: req.user.id,
        userName: req.user.name
      })
      await Activity.create(activityPayload)
    } catch (e) {
      console.warn('Activity logging failed (addItem):', e?.message || e)
    }

    // Get user email once
    const email = await getRecipientEmail(req).catch(() => null)

    // 1) Immediately send a detailed "item added" email (if email configured)
    if (email) {
      try {
        const { subject, textBody, htmlBody } = buildItemAddedEmail(item)
        await sendEmail(email, subject, htmlBody, textBody)
      } catch (e) {
        console.error('[itemController] sendEmail item-added failed', e)
      }
    }

    // 2) Auto-notify if expiring within 3 days (per-user push + detailed expiry email)
    const d = daysBetween(new Date(), item.expiryDate)
    if (d <= 3 && d >= 0) {
      const title = 'Expiring Soon'
      const msg = `${item.name} expires in ${d} day(s).`

      // idempotent create: check first
      try {
        const exists = await Notification.findOne({
          userId: req.user.id,
          itemId: item._id,
          type: 'push',
          title
        }).lean()

        if (!exists) {
          try {
            await Notification.create({ userId: req.user.id, itemId: item._id, title, message: msg, type: 'push' })
          } catch (e) {
            if (e && e.code === 11000) {
              console.warn('[itemController] notification duplicate (ignored)', item._id)
            } else {
              console.warn('[itemController] notification save failed', e?.message || e)
            }
          }
        }
      } catch (e) {
        console.warn('[itemController] notification existence check failed', e?.message || e)
      }

      // Send push first; only mark notified after push succeeded
      try {
        await sendPushToUser(req.user.id, title, msg)
        await Item.updateOne({ _id: item._id }, { $set: { notified: true, notifiedAt: new Date() } })
      } catch (e) {
        console.error('[itemController] sendPushToUser failed', (e && e.statusCode) || e)
      }

      // Send detailed "expiring soon" email as well
      if (email) {
        const { subject: expSubject, textBody: expText, htmlBody: expHtml } = buildExpiryEmailDetails(item)
        sendEmail(email, expSubject, expHtml, expText).catch((e) =>
          console.error('[itemController] sendEmail expiring-soon failed', e)
        )
      }
    }

    return res.status(201).json(item)
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    return next(err)
  }
}

export async function getItems(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })

    const {
      category,
      status,
      q,
      minCost,
      maxCost,
      sort = 'expiryDate',
      order = 'asc',
      page = 1,
      limit = 20
    } = req.query

    const find = { userId: req.user.id }

    if (category) find.category = normalizeCategory(category)
    if (status) find.status = status

    if (minCost || maxCost) {
      find.estimatedCost = {}
      if (minCost) find.estimatedCost.$gte = Number(minCost)
      if (maxCost) find.estimatedCost.$lte = Number(maxCost)
    }

    if (q) {
      const rex = new RegExp(String(q).trim(), 'i')
      find.$or = [{ name: rex }, { brand: rex }, { barcode: rex }]
    }

    const sortMap = { expiryDate: 'expiryDate', createdAt: 'createdAt', estimatedCost: 'estimatedCost', name: 'name' }
    const sortField = sortMap[sort] || 'expiryDate'
    const sortDir = order === 'desc' ? -1 : 1

    const pageNum = Math.max(Number(page), 1)
    const perPage = Math.min(Math.max(Number(limit), 1), 100)
    const skip = (pageNum - 1) * perPage

    const [items, total] = await Promise.all([
      Item.find(find).sort({ [sortField]: sortDir }).skip(skip).limit(perPage),
      Item.countDocuments(find)
    ])

    return res.json({ items, total, page: pageNum, pages: Math.ceil(total / perPage) })
  } catch (err) {
    return next(err)
  }
}

/**
 * markExpired
 * Marks items expired when expiryDate <= now and status is not 'expired' or 'consumed'.
 * Can be called as an Express handler (req,res,next) or programmatically (no req/res).
 *
 * If req.user.id exists we limit to that user's items (useful if you expose route).
 * If called without req (programmatic via cron), it will run globally for all users.
 *
 * Returns an object similar to Mongo updateMany result: { acknowledged, modifiedCount, matchedCount }
 */
export async function markExpired(req, res, next) {
  try {
    const now = new Date()

    const baseFilter = (req && req.user && req.user.id)
      ? { userId: new mongoose.Types.ObjectId(req.user.id) }
      : {}

    // Use <= so items whose expiryDate equals 'now' also get marked (safest)
    const filter = {
      ...baseFilter,
      expiryDate: { $lte: now },
      status: { $nin: ['expired', 'consumed'] }
    }

    const update = {
      $set: { status: 'expired', updatedAt: new Date() }
    }

    const result = await Item.updateMany(filter, update)

    // Only create activity if something actually changed
    try {
      const modifiedCount = result?.modifiedCount ?? result?.nModified ?? 0
      if (modifiedCount > 0) {
        const msg = `Auto-mark expired: ${modifiedCount} item(s) (expiryDate <= ${now.toISOString()})`
        await Activity.create({
          userId: (req && req.user && req.user.id) ? req.user.id : null,
          type: 'system:expire',
          message: msg,
          meta: { modifiedCount }
        })
      }
    } catch (e) {
      console.warn('Failed to log markExpired activity:', e?.message || e)
    }

    if (req && req.method) {
      // Express-style call: respond JSON
      return res.json({ ok: true, result })
    }
    // programmatic call: return result
    return result
  } catch (err) {
    if (next) return next(err)
    throw err
  }
}

export async function updateItem(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })
    const id = req.params.id

    const update = {
      ...(req.body?.name !== undefined ? { name: String(req.body.name).trim() } : {}),
      ...(req.body?.category !== undefined ? { category: normalizeCategory(req.body.category) } : {}),
      ...(req.body?.dosage !== undefined ? { dosage: req.body.dosage } : {}),
      ...(req.body?.expiryDate !== undefined ? { expiryDate: toDate(req.body.expiryDate) } : {}),
      ...(req.body?.reminderTime !== undefined ? { reminderTime: toDate(req.body.reminderTime) } : {}),
      ...(req.body?.barcode !== undefined ? { barcode: (req.body?.barcode || '').toString().trim() || undefined } : {}),
      ...(req.body?.estimatedCost !== undefined ? { estimatedCost: toNum(req.body?.estimatedCost) } : {}),
      ...(req.body?.brand !== undefined ? { brand: (req.body?.brand || '').toString().trim() || undefined } : {}),
      ...(req.body?.quantity !== undefined ? { quantity: toNum(req.body?.quantity) } : {}),
      ...(req.body?.unit !== undefined ? { unit: req.body.unit } : {}),
      ...(req.body?.location !== undefined ? { location: req.body.location } : {}),
      ...(req.body?.notes !== undefined ? { notes: (req.body?.notes || '').toString().trim() || undefined } : {}),
      ...(req.body?.purchaseDate !== undefined ? { purchaseDate: toDate(req.body?.purchaseDate) } : {}),
      ...(req.body?.openedAt !== undefined ? { openedAt: toDate(req.body.openedAt) } : {}),
      ...(req.body?.status !== undefined ? { status: req.body.status } : {}),
      ...(req.body?.consumedAt !== undefined ? { consumedAt: toDate(req.body.consumedAt) } : {})
    }

    if (update.status === 'consumed' && update.consumedAt === undefined) {
      update.consumedAt = new Date()
    }

    const item = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'Item not found' })

    try {
      const activityPayload = makeActivityPayload({
        type: 'item:update',
        message: `${item.name} updated`,
        meta: { itemId: item._id, item: item, changes: req.body?.changes || undefined },
        userId: req.user.id,
        userName: req.user.name
      })
      await Activity.create(activityPayload)
    } catch (e) {
      console.warn('Activity logging failed (updateItem):', e?.message || e)
    }

    const d = daysBetween(new Date(), new Date(item.expiryDate))
    if (d <= 3 && d >= 0) {
      const email = await getRecipientEmail(req).catch(() => null)
      const title = 'Item Expiring Soon (Updated)'
      const msg = `${item.name} expires in ${d} day(s).`

      try {
        const exists = await Notification.findOne({
          userId: req.user.id,
          itemId: item._id,
          type: 'push',
          title
        }).lean()

        if (!exists) {
          try {
            await Notification.create({ userId: req.user.id, itemId: item._id, title, message: msg, type: 'push' })
          } catch (e) {
            if (e && e.code === 11000) {
              console.warn('[itemController] notification duplicate (ignored)', item._id)
            } else {
              console.warn('[itemController] notification save failed', e?.message || e)
            }
          }
        }
      } catch (e) {
        console.warn('[itemController] notification existence check failed', e?.message || e)
      }

      try {
        await sendPushToUser(req.user.id, title, msg)
        await Item.updateOne({ _id: item._id }, { $set: { notified: true, notifiedAt: new Date() } })
      } catch (e) {
        console.error('[itemController] sendPushToUser failed', (e && e.statusCode) || e)
      }

      if (email) {
        const { subject, textBody, htmlBody } = buildExpiryEmailDetails(item)
        sendEmail(email, subject, htmlBody, textBody).catch((e) =>
          console.error('[itemController] sendEmail failed', e)
        )
      }
    }

    return res.json(item)
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    return next(err)
  }
}

export async function deleteItem(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (item) {
      try {
        const activityPayload = makeActivityPayload({
          type: 'item:delete',
          message: `${item.name} removed`,
          meta: { itemId: item._id, itemName: item.name, expiryDate: item.expiryDate },
          userId: req.user.id,
          userName: req.user.name
        })
        await Activity.create(activityPayload)
      } catch (e) {
        console.warn('Activity logging failed (deleteItem):', e?.message || e)
      }
    }
    return res.json({ deleted: !!item })
  } catch (err) {
    return next(err)
  }
}

export default {
  addItem,
  getItems,
  updateItem,
  deleteItem,
  markExpired
}
