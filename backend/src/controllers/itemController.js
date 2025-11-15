// import Item from '../models/Item.js'
// import Notification from '../models/Notification.js'
// import { sendEmail } from '../utils/mailer.js'
// import { sendPushToAll } from '../utils/push.js'

// const daysBetween = (a, b) => Math.ceil((b - a) / (1000 * 60 * 60 * 24))

// export async function addItem(req, res, next) {
//   try {
//     const { name, category, dosage, expiryDate, reminderTime, barcode, estimatedCost } = req.body
//     if (!name || !expiryDate) return res.status(400).json({ error: 'Name and expiryDate required' })
//     const item = await Item.create({
//       userId: req.user.id,
//       name,
//       category,
//       dosage,
//       expiryDate,
//       reminderTime,
//       barcode,
//       estimatedCost
//     })

//     // Auto-notification if expiry < 3 days
//     const d = daysBetween(new Date(), new Date(expiryDate))
//     if (d <= 3 && d >= 0) {
//       const title = 'Expiring soon'
//       const message = `${name} expires in ${d} day(s).`
//       await Notification.create({ userId: req.user.id, itemId: item._id, title, message, type: 'email' })
//       sendEmail(req.user.email, title, message).catch(() => {})
//       sendPushToAll(title, message).catch(() => {})
//     }

//     res.json(item)
//   } catch (err) {
//     next(err)
//   }
// }

// export async function getItems(req, res, next) {
//   try {
//     const items = await Item.find({ userId: req.user.id }).sort({ expiryDate: 1 })
//     res.json(items)
//   } catch (err) {
//     next(err)
//   }
// }

// export async function updateItem(req, res, next) {
//   try {
//     const id = req.params.id
//     const update = req.body
//     const item = await Item.findOneAndUpdate({ _id: id, userId: req.user.id }, update, { new: true })
//     if (!item) return res.status(404).json({ error: 'Item not found' })

//     const d = daysBetween(new Date(), new Date(item.expiryDate))
//     if (d <= 3 && d >= 0) {
//       const title = 'Updated item expiring soon'
//       const message = `${item.name} expires in ${d} day(s).`
//       await Notification.create({ userId: req.user.id, itemId: item._id, title, message, type: 'push' })
//       sendPushToAll(title, message).catch(() => {})
//     }

//     res.json(item)
//   } catch (err) {
//     next(err)
//   }
// }

// export async function deleteItem(req, res, next) {
//   try {
//     const id = req.params.id
//     const item = await Item.findOneAndDelete({ _id: id, userId: req.user.id })
//     res.json({ deleted: !!item })
//   } catch (err) {
//     next(err)
//   }
// }
// import Item from '../models/Item.js';
// import Notification from '../models/Notification.js';
// import { sendEmail } from '../utils/mailer.js';
// import { sendPushToAll } from '../utils/push.js';

// const daysBetween = (a, b) => Math.ceil((b - a) / (1000 * 60 * 60 * 24));

// // --- category normalization ---
// const ALLOWED = new Set(['grocery', 'medicine', 'cosmetic', 'beverage', 'other']);
// function normalizeCategory(input) {
//   if (!input) return 'grocery';
//   const c = String(input).trim().toLowerCase();
//   if (c === 'groceries') return 'grocery';
//   if (c === 'medicines') return 'medicine';
//   if (c === 'cosmetics') return 'cosmetic';
//   if (c === 'beverages') return 'beverage';
//   if (c === 'others') return 'other';
//   return ALLOWED.has(c) ? c : 'grocery';
// }
// // --------------------------------

// export async function addItem(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//     const { name, category, dosage, expiryDate, reminderTime, barcode, estimatedCost } = req.body || {};
//     if (!name || !expiryDate) return res.status(400).json({ error: 'Name and expiryDate required' });

//     const exp = new Date(expiryDate);
//     if (isNaN(exp)) return res.status(400).json({ error: 'Invalid expiryDate' });

//     const reminder = reminderTime ? new Date(reminderTime) : undefined;
//     if (reminderTime && isNaN(reminder)) return res.status(400).json({ error: 'Invalid reminderTime' });

//     const item = await Item.create({
//       userId: req.user.id,
//       name: String(name).trim(),
//       category: normalizeCategory(category),
//       dosage,
//       expiryDate: exp,
//       reminderTime: reminder,
//       barcode,
//       estimatedCost: typeof estimatedCost === 'number' ? estimatedCost : undefined
//     });

//     // Auto-notification if expiry < 3 days
//     const d = daysBetween(new Date(), exp);
//     if (d <= 3 && d >= 0) {
//       const title = 'Expiring soon';
//       const message = `${item.name} expires in ${d} day(s).`;
//       try {
//         await Notification.create({ userId: req.user.id, itemId: item._id, title, message, type: 'email' });
//         await sendEmail(req.user.email, title, message);
//         await sendPushToAll(title, message);
//       } catch { /* ignore notification failures */ }
//     }

//     return res.status(201).json(item);
//   } catch (err) {
//     if (err?.name === 'ValidationError') return res.status(400).json({ error: err.message });
//     return next(err);
//   }
// }

// export async function getItems(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
//     const items = await Item.find({ userId: req.user.id }).sort({ expiryDate: 1, createdAt: -1 });
//     return res.json(items);
//   } catch (err) {
//     return next(err);
//   }
// }

// export async function updateItem(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
//     const id = req.params.id;

//     const update = { ...(req.body || {}) };

//     if (update.category !== undefined) {
//       update.category = normalizeCategory(update.category);
//     }
//     if (update.expiryDate) {
//       const exp = new Date(update.expiryDate);
//       if (isNaN(exp)) return res.status(400).json({ error: 'Invalid expiryDate' });
//       update.expiryDate = exp;
//     }
//     if (update.reminderTime) {
//       const rem = new Date(update.reminderTime);
//       if (isNaN(rem)) return res.status(400).json({ error: 'Invalid reminderTime' });
//       update.reminderTime = rem;
//     }

//     const item = await Item.findOneAndUpdate(
//       { _id: id, userId: req.user.id },
//       update,
//       { new: true, runValidators: true }
//     );
//     if (!item) return res.status(404).json({ error: 'Item not found' });

//     const d = daysBetween(new Date(), new Date(item.expiryDate));
//     if (d <= 3 && d >= 0) {
//       const title = 'Updated item expiring soon';
//       const message = `${item.name} expires in ${d} day(s).`;
//       try {
//         await Notification.create({ userId: req.user.id, itemId: item._id, title, message, type: 'push' });
//         await sendPushToAll(title, message);
//       } catch {}
//     }

//     return res.json(item);
//   } catch (err) {
//     if (err?.name === 'ValidationError') return res.status(400).json({ error: err.message });
//     return next(err);
//   }
// }

// export async function deleteItem(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
//     const id = req.params.id;
//     const item = await Item.findOneAndDelete({ _id: id, userId: req.user.id });
//     return res.json({ deleted: !!item });
//   } catch (err) {
//     return next(err);
//   }
// }














// import Item from '../models/Item.js';
// import Notification from '../models/Notification.js';
// import { sendEmail } from '../utils/mailer.js';
// import { sendPushToAll } from '../utils/push.js';

// const daysBetween = (a, b) => Math.ceil((b - a) / (1000 * 60 * 60 * 24));

// // normalize category values coming from UI
// const ALLOWED = new Set(['grocery', 'medicine', 'cosmetic', 'beverage', 'other']);
// function normalizeCategory(input) {
//   if (!input) return 'grocery';
//   const c = String(input).trim().toLowerCase();
//   if (c === 'groceries') return 'grocery';
//   if (c === 'medicines') return 'medicine';
//   if (c === 'cosmetics') return 'cosmetic';
//   if (c === 'beverages') return 'beverage';
//   if (c === 'others') return 'other';
//   return ALLOWED.has(c) ? c : 'grocery';
// }
// const toDate = (v) => (v ? (isNaN(new Date(v)) ? undefined : new Date(v)) : undefined);
// const toNum  = (v) => (v === '' || v === null || v === undefined ? undefined : (isNaN(Number(v)) ? undefined : Number(v)));

// export async function addItem(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//     const {
//       name, category, dosage, expiryDate, reminderTime, barcode, estimatedCost,
//       brand, quantity, unit, location, notes, purchaseDate, openedAt
//     } = req.body || {};

//     if (!name || !expiryDate) return res.status(400).json({ error: 'Name and expiryDate required' });

//     const payload = {
//       userId: req.user.id,
//       name: String(name).trim(),
//       category: normalizeCategory(category),
//       dosage,
//       expiryDate: toDate(expiryDate),
//       reminderTime: toDate(reminderTime),
//       barcode: barcode?.toString().trim(),
//       estimatedCost: toNum(estimatedCost),
//       brand: brand?.toString().trim(),
//       quantity: toNum(quantity),
//       unit,
//       location,
//       notes: notes?.toString().trim(),
//       purchaseDate: toDate(purchaseDate),
//       openedAt: toDate(openedAt)
//     };
//     if (!payload.expiryDate) return res.status(400).json({ error: 'Invalid expiryDate' });

//     const item = await Item.create(payload);

//     // notify if expiring soon
//     const d = daysBetween(new Date(), item.expiryDate);
//     if (d <= 3 && d >= 0) {
//       const title = 'Expiring soon';
//       const message = `${item.name} expires in ${d} day(s).`;
//       Promise.allSettled([
//         Notification.create({ userId: req.user.id, itemId: item._id, title, message, type: 'email' }),
//         sendEmail(req.user.email, title, message),
//         sendPushToAll(title, message)
//       ]).catch(() => {});
//     }

//     return res.status(201).json(item);
//   } catch (err) {
//     if (err?.name === 'ValidationError') return res.status(400).json({ error: err.message });
//     return next(err);
//   }
// }

// /** UPGRADED: filtering/sorting/pagination/search */
// export async function getItems(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//     const {
//       category,            // 'grocery'|'medicine'|'cosmetic'|'beverage'|'other'
//       status,              // 'active'|'expired'|'consumed'
//       q,                   // free text: name/brand/barcode
//       minCost, maxCost,    // numbers
//       sort = 'expiryDate', // 'expiryDate'|'createdAt'|'estimatedCost'|'name'
//       order = 'asc',       // 'asc'|'desc'
//       page = 1,
//       limit = 20
//     } = req.query;

//     const find = { userId: req.user.id };

//     if (category) find.category = category;
//     if (status)   find.status = status;

//     if (minCost || maxCost) {
//       find.estimatedCost = {};
//       if (minCost) find.estimatedCost.$gte = Number(minCost);
//       if (maxCost) find.estimatedCost.$lte = Number(maxCost);
//     }

//     if (q) {
//       const rex = new RegExp(String(q).trim(), 'i');
//       find.$or = [{ name: rex }, { brand: rex }, { barcode: rex }];
//     }

//     const sortMap = {
//       expiryDate: 'expiryDate',
//       createdAt: 'createdAt',
//       estimatedCost: 'estimatedCost',
//       name: 'name'
//     };
//     const sortField = sortMap[sort] || 'expiryDate';
//     const sortDir = order === 'desc' ? -1 : 1;

//     const pageNum = Math.max(Number(page), 1);
//     const perPage = Math.min(Math.max(Number(limit), 1), 100);
//     const skip = (pageNum - 1) * perPage;

//     const [items, total] = await Promise.all([
//       Item.find(find).sort({ [sortField]: sortDir }).skip(skip).limit(perPage),
//       Item.countDocuments(find)
//     ]);

//     res.json({ items, total, page: pageNum, pages: Math.ceil(total / perPage) });
//   } catch (err) {
//     return next(err);
//   }
// }

// export async function updateItem(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
//     const id = req.params.id;

//     const {
//       name, category, dosage, expiryDate, reminderTime, barcode, estimatedCost,
//       brand, quantity, unit, location, notes, purchaseDate, openedAt,
//       status, consumedAt
//     } = req.body || {};

//     const update = {
//       ...(name !== undefined ? { name: String(name).trim() } : {}),
//       ...(category !== undefined ? { category: normalizeCategory(category) } : {}),
//       ...(dosage !== undefined ? { dosage } : {}),
//       ...(expiryDate !== undefined ? { expiryDate: toDate(expiryDate) } : {}),
//       ...(reminderTime !== undefined ? { reminderTime: toDate(reminderTime) } : {}),
//       ...(barcode !== undefined ? { barcode: barcode?.toString().trim() } : {}),
//       ...(estimatedCost !== undefined ? { estimatedCost: toNum(estimatedCost) } : {}),
//       ...(brand !== undefined ? { brand: brand?.toString().trim() } : {}),
//       ...(quantity !== undefined ? { quantity: toNum(quantity) } : {}),
//       ...(unit !== undefined ? { unit } : {}),
//       ...(location !== undefined ? { location } : {}),
//       ...(notes !== undefined ? { notes: notes?.toString().trim() } : {}),
//       ...(purchaseDate !== undefined ? { purchaseDate: toDate(purchaseDate) } : {}),
//       ...(openedAt !== undefined ? { openedAt: toDate(openedAt) } : {}),
//       ...(status !== undefined ? { status } : {}),
//       ...(consumedAt !== undefined ? { consumedAt: toDate(consumedAt) } : {})
//     };

//     const item = await Item.findOneAndUpdate(
//       { _id: id, userId: req.user.id },
//       update,
//       { new: true, runValidators: true }
//     );
//     if (!item) return res.status(404).json({ error: 'Item not found' });

//     // if updated item expires soon, push a reminder
//     const d = daysBetween(new Date(), new Date(item.expiryDate));
//     if (d <= 3 && d >= 0) {
//       const title = 'Updated item expiring soon';
//       const message = `${item.name} expires in ${d} day(s).`;
//       Promise.allSettled([
//         Notification.create({ userId: req.user.id, itemId: item._id, title, message, type: 'push' }),
//         sendPushToAll(title, message)
//       ]).catch(() => {});
//     }

//     return res.json(item);
//   } catch (err) {
//     if (err?.name === 'ValidationError') return res.status(400).json({ error: err.message });
//     return next(err);
//   }
// }

// export async function deleteItem(req, res, next) {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
//     const id = req.params.id;
//     const item = await Item.findOneAndDelete({ _id: id, userId: req.user.id });
//     return res.json({ deleted: !!item });
//   } catch (err) {
//     return next(err);
//   }
// }
// backend/src/controllers/itemController.js
import Item from '../models/Item.js'
import Notification from '../models/Notification.js'
import { sendEmail } from '../utils/mailer.js'
import { sendPushToAll } from '../utils/push.js'
import { getRecipientEmail } from '../utils/notify.js'
import Activity from '../models/Activity.js' // <-- added to log activities on item ops
import { makeActivityPayload } from '../utils/activityHelper.js' // NEW helper for standardized payloads

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
      // non-fatal: don't block item creation if logging fails
      console.warn('Activity logging failed (addItem):', e?.message || e)
    }

    // auto-notify if expiring within 3 days
    const d = daysBetween(new Date(), item.expiryDate)
    if (d <= 3 && d >= 0) {
      const email = await getRecipientEmail(req).catch(() => null)
      const title = 'Expiring Soon'
      const msg = `${item.name} expires in ${d} day(s).`
      Promise.allSettled([
        Notification.create({ userId: req.user.id, itemId: item._id, title, message: msg, type: 'email' }),
        email ? sendEmail(email, title, msg) : Promise.resolve(),
        sendPushToAll(title, msg)
      ]).catch(() => {})
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
      ...(req.body?.reminderTime !== undefined ? { reminderTime: toDate(req.body.reminderTime) } : {}),
      ...(req.body?.barcode !== undefined ? { barcode: (req.body.barcode || '').toString().trim() || undefined } : {}),
      ...(req.body?.estimatedCost !== undefined ? { estimatedCost: toNum(req.body.estimatedCost) } : {}),
      ...(req.body?.brand !== undefined ? { brand: (req.body.brand || '').toString().trim() || undefined } : {}),
      ...(req.body?.quantity !== undefined ? { quantity: toNum(req.body.quantity) } : {}),
      ...(req.body?.unit !== undefined ? { unit: req.body.unit } : {}),
      ...(req.body?.location !== undefined ? { location: req.body.location } : {}),
      ...(req.body?.notes !== undefined ? { notes: (req.body?.notes || '').toString().trim() || undefined } : {}),
      ...(req.body?.purchaseDate !== undefined ? { purchaseDate: toDate(req.body.purchaseDate) } : {}),
      ...(req.body?.openedAt !== undefined ? { openedAt: toDate(req.body.openedAt) } : {}),
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
      Promise.allSettled([
        Notification.create({ userId: req.user.id, itemId: item._id, title, message: msg, type: 'push' }),
        sendPushToAll(title, msg),
        email ? sendEmail(email, title, msg) : Promise.resolve()
      ]).catch(() => {})
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
