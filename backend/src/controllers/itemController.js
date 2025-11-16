// src/controllers/itemController.js
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

    // auto-notify if expiring within 3 days (per-user push)
    const d = daysBetween(new Date(), item.expiryDate)
    if (d <= 3 && d >= 0) {
      const email = await getRecipientEmail(req).catch(() => null)
      const title = 'Expiring Soon'
      const msg = `${item.name} expires in ${d} day(s).`

      // Save Notification (history)
      Notification.create({ userId: req.user.id, itemId: item._id, title, message: msg, type: 'push' })
        .catch(() => {})

      // Send per-user push (do not broadcast)
      try {
        await sendPushToUser(req.user.id, title, msg)
        // mark item notified so cron won't re-send
        await Item.updateOne({ _id: item._id }, { $set: { notified: true, notifiedAt: new Date() } });
      } catch (e) {
        console.error('[itemController] sendPushToUser failed', e && e.statusCode || e)
        // do not fail the API - notification attempts are best-effort
      }

      // Send email if possible (optional)
      if (email) {
        sendEmail(email, title, msg).catch((e) => console.error('[itemController] sendEmail failed', e));
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

export async function updateItem(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })
    const id = req.params.id

    const update = {
      ...(req.body?.name !== undefined ? { name: String(req.body.name).trim() } : {}),
      ...(req.body?.category !== undefined ? { category: normalizeCategory(req.body.category) } : {}),
      ...(req.body?.dosage !== undefined ? { dosage: req.body.dosage } : {}),
      ...(req.body?.expiryDate !== undefined ? { expiryDate: toDate(req.body.expiryDate) } : {}),
      ...(req.body?.reminderTime !== undefined ? { reminderTime: toDate(req.body?.reminderTime) } : {}),
      ...(req.body?.barcode !== undefined ? { barcode: (req.body.barcode || '').toString().trim() || undefined } : {}),
      ...(req.body?.estimatedCost !== undefined ? { estimatedCost: toNum(req.body.estimatedCost) } : {}),
      ...(req.body?.brand !== undefined ? { brand: (req.body?.brand || '').toString().trim() || undefined } : {}),
      ...(req.body?.quantity !== undefined ? { quantity: toNum(req.body?.quantity) } : {}),
      ...(req.body?.unit !== undefined ? { unit: req.body.unit } : {}),
      ...(req.body?.location !== undefined ? { location: req.body.location } : {}),
      ...(req.body?.notes !== undefined ? { notes: (req.body?.notes || '').toString().trim() || undefined } : {}),
      ...(req.body?.purchaseDate !== undefined ? { purchaseDate: toDate(req.body?.purchaseDate) } : {}),
      ...(req.body?.openedAt !== undefined ? { openedAt: toDate(req.body?.openedAt) } : {}),
      ...(req.body?.status !== undefined ? { status: req.body.status } : {}),
      ...(req.body?.consumedAt !== undefined ? { consumedAt: toDate(req.body.consumedAt) } : {})
    }

    const item = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'Item not found' })

    // Log activity: store updated item in meta for details
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

      // Persist notification record
      Notification.create({ userId: req.user.id, itemId: item._id, title, message: msg, type: 'push' })
        .catch(() => {})

      // Send per-user push and mark notified
      try {
        await sendPushToUser(req.user.id, title, msg);
        await Item.updateOne({ _id: item._id }, { $set: { notified: true, notifiedAt: new Date() } });
      } catch (e) {
        console.error('[itemController] sendPushToUser failed', e && e.statusCode || e)
      }

      // Send email if possible
      if (email) {
        sendEmail(email, title, msg).catch((e) => console.error('[itemController] sendEmail failed', e));
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
