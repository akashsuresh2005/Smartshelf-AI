// // backend/src/utils/cronJobs.js

// import cron from 'node-cron'
// import Item from '../models/Item.js'
// import { sendPushToUser } from '../utils/push.js'
// import { sendEmail } from './mailer.js'
// import Notification from '../models/Notification.js'
// import { markExpired } from '../controllers/itemController.js'

// // ✅ NEW: WhatsApp imports
// import { sendWhatsApp } from './whatsappService.js'
// import { buildWhatsAppMessage } from './whatsappFormatter.js'

// /**
//  * Build a detailed email (subject, text, html) for an expiring item.
//  */
// function buildExpiryEmail(item) {
//   const now = new Date()
//   const expiry = new Date(item.expiryDate)
//   const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

//   const subject = `SmartShelf – ${item.name} expires in ${diffDays} day(s)`

//   let suggestion
//   if (diffDays < 0) {
//     suggestion = 'This item is already expired. Please discard it safely.'
//   } else if (diffDays === 0) {
//     suggestion = 'Use this item today or discard it if it looks or smells unusual.'
//   } else if (diffDays <= 2) {
//     suggestion = 'Plan a meal in the next 1–2 days that uses this item so it does not go to waste.'
//   } else {
//     suggestion = 'Keep this item near the front of your shelf so you remember to use it soon.'
//   }

//   const textBody = `
// Your item "${item.name}" is expiring soon.

// Item details:
// - Name       : ${item.name}
// - Category   : ${item.category || 'N/A'}
// - Quantity   : ${item.quantity || 'N/A'}
// - Location   : ${item.location || 'N/A'}
// - Added on   : ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
// - Expiry date: ${expiry.toLocaleDateString()}
// - Days left  : ${diffDays < 0 ? 'Already expired' : diffDays}

// Suggestion:
// ${suggestion}

// This reminder was sent by SmartShelf so you can reduce food waste and save money.
//   `.trim()

//   const htmlBody = `
//     <h2>🕒 Item expiring soon</h2>
//     <p>Your item <strong>${item.name}</strong> is close to its expiry date.</p>

//     <h3>Item details</h3>
//     <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
//       <tr><td><strong>Name</strong></td><td>${item.name}</td></tr>
//       <tr><td><strong>Category</strong></td><td>${item.category || 'N/A'}</td></tr>
//       <tr><td><strong>Quantity</strong></td><td>${item.quantity || 'N/A'}</td></tr>
//       <tr><td><strong>Location</strong></td><td>${item.location || 'N/A'}</td></tr>
//       <tr><td><strong>Added on</strong></td><td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
//       <tr><td><strong>Expiry date</strong></td><td>${expiry.toLocaleDateString()}</td></tr>
//       <tr><td><strong>Days left</strong></td><td>${diffDays < 0 ? 'Already expired' : diffDays}</td></tr>
//     </table>

//     <h3>Suggestion 💡</h3>
//     <p>${suggestion}</p>

//     <p style="margin-top:16px;font-size:12px;color:#666;">
//       — SmartShelf AI • Helping you track what’s in your shelf
//     </p>
//   `

//   return { subject, textBody, htmlBody }
// }

// /**
//  * initCronJobs()
//  */
// export function initCronJobs() {
//   const schedule = process.env.CRON_SCHEDULE || '18 13 * * *'
//   const tz = process.env.CRON_TZ || 'Asia/Kolkata'

//   console.log('[cron] starting expiry cron with schedule:', schedule, 'tz:', tz)

//   cron.schedule(
//     schedule,
//     async () => {
//       console.log('[cron] CRON tick - start:', new Date().toISOString())

//       // STEP 1 — Mark expired
//       try {
//         console.log('[cron] Running markExpired()...')
//         const res = await markExpired()
//         const modifiedCount = (res?.modifiedCount ?? res?.nModified) ?? 0

//         if (modifiedCount > 0) {
//           console.log('[cron] markExpired updated items:', modifiedCount)
//         } else {
//           console.log('[cron] markExpired: no expired items')
//         }
//       } catch (err) {
//         console.error('[cron] markExpired() failed:', err?.message || err)
//       }

//       // STEP 2 — Find expiring items
//       try {
//         console.log('[cron] Checking items expiring soon...')

//         const now = new Date()
//         const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

//         const expiringItems = await Item.find({
//           status: 'active',
//           expiryDate: { $gte: now, $lte: in7 },
//           notified: { $ne: true }
//         }).lean()

//         console.log('[cron] Found', expiringItems.length, 'expiring items')

//         // STEP 3 — Process each item
//         for (const item of expiringItems) {
//           try {
//             const userId = item.userId
//             const { subject, textBody, htmlBody } = buildExpiryEmail(item)

//             const exists = await Notification.findOne({
//               userId,
//               itemId: item._id,
//               type: 'push',
//               title: subject
//             }).lean()

//             if (!exists) {
//               await Notification.create({
//                 userId,
//                 itemId: item._id,
//                 title: subject,
//                 message: textBody,
//                 type: 'push'
//               })
//             }

//             // PUSH
//             let notifiedOk = false
//             try {
//               const shortBody = `${item.name} expires on ${new Date(
//                 item.expiryDate
//               ).toLocaleDateString()}`
//               await sendPushToUser(userId, subject, shortBody)
//               notifiedOk = true
//               console.log('[cron] push sent for', item._id)
//             } catch (e) {
//               console.error('[cron] push error', e)
//             }

//             // EMAIL
//             if (item.email && notifiedOk) {
//               try {
//                 await sendEmail(item.email, subject, htmlBody, textBody)
//                 console.log('[cron] email sent')
//               } catch (e) {
//                 console.warn('[cron] email failed', e)
//               }
//             }

//             // ✅ NEW: WHATSAPP
//             if (item.phone && notifiedOk) {
//               try {
//                 const waMessage = buildWhatsAppMessage(item)
//                 await sendWhatsApp(item.phone, waMessage, item.imageUrl)
//                 console.log('[cron] whatsapp sent for', item._id)
//               } catch (e) {
//                 console.warn('[cron] whatsapp failed', e?.message)
//               }
//             }

//             // MARK NOTIFIED
//             if (notifiedOk) {
//               await Item.updateOne(
//                 { _id: item._id },
//                 { $set: { notified: true, notifiedAt: new Date() } }
//               )
//               console.log('[cron] marked as notified:', item._id)
//             }

//           } catch (inner) {
//             console.error('[cron] error processing item', item._id, inner)
//           }
//         }
//       } catch (err) {
//         console.error('[cron] failure while checking expiring items', err)
//       }

//       console.log('[cron] CRON tick - done:', new Date().toISOString())
//     },
//     { timezone: tz }
//   )

//   // Initial run
//   ;(async () => {
//     try {
//       console.log('[cron] Initial markExpired()...')
//       await markExpired()
//     } catch (err) {
//       console.error('[cron] initial markExpired failed', err)
//     }
//   })()
// }


// backend/src/utils/cronJobs.js

import cron from 'node-cron'
import Item from '../models/Item.js'
import User from '../models/User.js' // ✅ ADDED
import { sendPushToUser } from '../utils/push.js'
import { sendEmail } from './mailer.js'
import Notification from '../models/Notification.js'
import { markExpired } from '../controllers/itemController.js'

// WhatsApp
import { sendWhatsApp } from './whatsappService.js'
import { buildWhatsAppMessage } from './whatsappFormatter.js'

function buildExpiryEmail(item) {
  const now = new Date()
  const expiry = new Date(item.expiryDate)
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

  const subject = `SmartShelf – ${item.name} expires in ${diffDays} day(s)`

  let suggestion
  if (diffDays < 0) {
    suggestion = 'This item is already expired. Please discard it safely.'
  } else if (diffDays === 0) {
    suggestion = 'Use this item today or discard it if it looks or smells unusual.'
  } else if (diffDays <= 2) {
    suggestion = 'Plan a meal in the next 1–2 days that uses this item.'
  } else {
    suggestion = 'Keep this item near the front.'
  }

  const textBody = `Item ${item.name} expiring soon`
  const htmlBody = `<h2>${item.name} expiring soon</h2>`

  return { subject, textBody, htmlBody }
}

export function initCronJobs() {
  const schedule = process.env.CRON_SCHEDULE || '18 13 * * *'
  const tz = process.env.CRON_TZ || 'Asia/Kolkata'

  console.log('[cron] starting expiry cron')

  // ================= EXISTING CRON =================
  cron.schedule(schedule, async () => {
    const now = new Date()
    const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const expiringItems = await Item.find({
      status: 'active',
      expiryDate: { $gte: now, $lte: in7 },
      notified: { $ne: true }
    }).lean()

    for (const item of expiringItems) {
      const user = await User.findById(item.userId)

      let notifiedOk = false

      try {
        await sendPushToUser(item.userId, item.name, "Expiring soon")
        notifiedOk = true
      } catch {}

      if (user?.email && notifiedOk) {
        await sendEmail(user.email, item.name, "Expiring soon")
      }

      // ✅ FIXED WHATSAPP
      if (user?.whatsappEnabled && user?.phone && notifiedOk) {
        const msg = buildWhatsAppMessage(item)
        await sendWhatsApp(user.phone, msg, item.imageUrl)
      }

      if (notifiedOk) {
        await Item.updateOne({ _id: item._id }, { notified: true })
      }
    }
  }, { timezone: tz })


  // ================= ✅ NEW DAILY SUMMARY =================
  cron.schedule('0 9 * * *', async () => {
    console.log('[cron] Daily summary running')

    const users = await User.find()

    for (let user of users) {
      if (!user.whatsappEnabled || !user.phone) continue

      const count = await Item.countDocuments({
        userId: user._id,
        status: 'active'
      })

      const msg = `
📊 *Daily Summary*

You have ${count} items in your shelf.

Stay organized with SmartShelf AI 🤖
`

      try {
        await sendWhatsApp(user.phone, msg)
        console.log('[cron] daily summary sent to', user.phone)
      } catch (e) {
        console.warn('[cron] summary failed', e?.message)
      }
    }
  }, { timezone: tz })


  // ================= EXISTING INITIAL =================
  ;(async () => {
    try {
      await markExpired()
    } catch (err) {
      console.error('[cron] initial markExpired failed', err)
    }
  })()
}