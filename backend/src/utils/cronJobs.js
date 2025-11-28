// // import cron from 'node-cron'
// // import Item from '../models/Item.js'
// // import Notification from '../models/Notification.js'
// // import { sendEmail } from './mailer.js'
// // import { sendPushToAll } from './push.js'

// // export function initCronJobs() {
// //   // Runs every day at 9:00 AM
// //   cron.schedule('0 9 * * *', async () => {
// //     try {
// //       const now = new Date()
// //       const soonItems = await Item.find({ status: 'active' })
// //       for (const i of soonItems) {
// //         const diffDays = Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24))
// //         if (diffDays <= 3 && diffDays >= 0) {
// //           const title = 'Daily reminder: expiring soon'
// //           const message = `${i.name} expires in ${diffDays} day(s).`
// //           await Notification.create({ userId: i.userId, itemId: i._id, title, message, type: 'email' })
// //           // You might need to fetch the user's email via populate; omitted for brevity
// //           sendPushToAll(title, message).catch(() => {})
// //         } else if (diffDays < 0 && i.status !== 'expired') {
// //           i.status = 'expired'
// //           await i.save()
// //         }
// //       }
// //       console.log('Cron job executed: expiry checks')
// //     } catch (err) {
// //       console.error('Cron error:', err.message)
// //     }
// //   })
// // }
// // src/utils/cronJobs.js
// import cron from 'node-cron';
// import Item from '../models/Item.js';
// import { sendPushToUser } from '../utils/push.js';
// import { sendEmail } from './mailer.js';
// import Notification from '../models/Notification.js';

// /**
//  * initCronJobs()
//  * - Uses CRON_SCHEDULE env var (optional)
//  * - Default: run daily at 09:00 (server timezone) => '0 9 * * *'
//  * - For testing set CRON_SCHEDULE='* * * * *' to run every minute.
//  */
// export function initCronJobs() {
//   const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
//   console.log('[cron] starting expiry cron with schedule:', schedule);

//   cron.schedule(schedule, async () => {
//     console.log('[cron] Checking expiring items...');
//     try {
//       const now = new Date();
//       const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

//       // Find active items expiring within 7 days and not notified yet
//       const expiringItems = await Item.find({
//         status: 'active',
//         expiryDate: { $gte: now, $lte: in7 },
//         notified: { $ne: true }
//       }).lean();

//       console.log('[cron] found', expiringItems.length, 'expiring items');

//       for (const item of expiringItems) {
//         try {
//           const userId = item.userId;
//           const title = `Expiry alert: ${item.name}`;
//           const body = `${item.name} expires on ${new Date(item.expiryDate).toLocaleDateString()}`;

//           // Persist a Notification record for history (non-blocking)
//           await Notification.create({
//             userId,
//             itemId: item._id,
//             title,
//             message: body,
//             type: 'push'
//           }).catch(e => console.warn('[cron] warning notification save failed', e?.message || e));

//           // Send push to specific user
//           await sendPushToUser(userId, title, body).catch(e => {
//             console.error('[cron] push send error for item', item._id, e && e.statusCode || e);
//           });

//           // Optionally send email too (keep original behavior)
//           try {
//             const emailsent = await sendEmail(item.email || null, title, body).catch(() => {});
//             // ignore if email not configured
//           } catch {}

//           // Mark as notified so we don't spam users; update item (set notified true)
//           await Item.updateOne({ _id: item._id }, { $set: { notified: true, notifiedAt: new Date() } });
//           console.log('[cron] marked item notified', item._id);
//         } catch (inner) {
//           console.error('[cron] error processing item', item._id, inner);
//         }
//       }
//     } catch (err) {
//       console.error('[cron] failure', err);
//     }
//     console.log('[cron] Done.');
//   }, { timezone: process.env.CRON_TZ || 'UTC' });
// }
// backend/src/utils/cronJobs.js
import cron from 'node-cron'
import Item from '../models/Item.js'
import { sendPushToUser } from '../utils/push.js'
import { sendEmail } from './mailer.js'
import Notification from '../models/Notification.js'
import { markExpired } from '../controllers/itemController.js' // marks items as expired

/**
 * Build a detailed email (subject, text, html) for an expiring item.
 */
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
    suggestion = 'Plan a meal in the next 1–2 days that uses this item so it does not go to waste.'
  } else {
    suggestion = 'Keep this item near the front of your shelf so you remember to use it soon.'
  }

  const textBody = `
Your item "${item.name}" is expiring soon.

Item details:
- Name       : ${item.name}
- Category   : ${item.category || 'N/A'}
- Quantity   : ${item.quantity || 'N/A'}
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
      <tr><td><strong>Quantity</strong></td><td>${item.quantity || 'N/A'}</td></tr>
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

/**
 * initCronJobs()
 * - Test schedule: runs daily at 12:39 (Asia/Kolkata timezone)
 * - In production you may prefer '0 9 * * *' for 9:00 AM daily
 * - Also runs markExpired() once immediately on server startup.
 */
export function initCronJobs() {
  // SCHEDULE — runs at 12:39 PM daily (Asia/Kolkata)
  const schedule = process.env.CRON_SCHEDULE || '18 13 * * *'

  // Set timezone to Asia/Kolkata (IST) by default, but allow override via CRON_TZ
  const tz = process.env.CRON_TZ || 'Asia/Kolkata'

  console.log('[cron] starting expiry cron with schedule:', schedule, 'tz:', tz)

  // MAIN CRON SCHEDULE
  cron.schedule(
    schedule,
    async () => {
      console.log('[cron] CRON tick - start:', new Date().toISOString())

      // STEP 1 — Mark items already expired
      try {
        console.log('[cron] Running markExpired()...')
        const res = await markExpired()
        const modifiedCount = (res?.modifiedCount ?? res?.nModified) ?? 0

        if (modifiedCount > 0) {
          console.log('[cron] markExpired updated items:', modifiedCount)
        } else {
          console.log('[cron] markExpired: no expired items')
        }
      } catch (err) {
        console.error('[cron] markExpired() failed:', err?.message || err)
      }

      // STEP 2 — Check for items expiring within 7 days
      try {
        console.log('[cron] Checking items expiring soon...')

        const now = new Date()
        const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const expiringItems = await Item.find({
          status: 'active',
          expiryDate: { $gte: now, $lte: in7 },
          notified: { $ne: true }
        }).lean()

        console.log('[cron] Found', expiringItems.length, 'expiring items')

        // STEP 3 — For each expiring item: create Notification, send Push, send Email
        for (const item of expiringItems) {
          try {
            const userId = item.userId

            // Build detailed email content
            const { subject, textBody, htmlBody } = buildExpiryEmail(item)

            // Idempotent notification creation (for push history)
            const exists = await Notification.findOne({
              userId,
              itemId: item._id,
              type: 'push',
              title: subject
            }).lean()

            if (!exists) {
              try {
                await Notification.create({
                  userId,
                  itemId: item._id,
                  title: subject,
                  message: textBody,
                  type: 'push'
                })
              } catch (e) {
                if (e?.code !== 11000) {
                  console.warn('[cron] notification save failed', e?.message || e)
                }
              }
            } else if (console.debug) {
              console.debug('[cron] notification already exists; skipping create for', item._id)
            }

            // Send push notification to the user (short version)
            let notifiedOk = false
            try {
              const shortBody = `${item.name} expires on ${new Date(
                item.expiryDate
              ).toLocaleDateString()}`
              await sendPushToUser(userId, subject, shortBody)
              notifiedOk = true
              console.log('[cron] push sent for', item._id)
            } catch (e) {
              console.error('[cron] push send error for item', item._id, e?.statusCode || e)
              notifiedOk = false
            }

            // Send rich email if email exists and push succeeded
            if (item.email && notifiedOk) {
              try {
                // 4th arg = plain text version for clients that don't support HTML
                await sendEmail(item.email, subject, htmlBody, textBody)
                console.log('[cron] email sent for', item._id)
              } catch (e) {
                console.warn('[cron] email send warning', e?.message || e)
              }
            }

            // Mark item as notified (only if push succeeded to avoid spam)
            if (notifiedOk) {
              await Item.updateOne(
                { _id: item._id },
                { $set: { notified: true, notifiedAt: new Date() } }
              )
              console.log('[cron] marked as notified:', item._id)
            } else {
              console.log('[cron] NOT marking notified because push failed:', item._id)
            }
          } catch (inner) {
            console.error('[cron] error processing item', item._id, inner)
          }
        }
      } catch (err) {
        console.error('[cron] failure while checking expiring items', err)
      }

      console.log('[cron] CRON tick - done:', new Date().toISOString())
    },
    { timezone: tz }
  )

  // Immediate one-off run at server startup to fix already-past items
  ;(async () => {
    try {
      console.log('[cron] Initial markExpired() at startup:', new Date().toISOString())
      const res = await markExpired()
      const modifiedCount = (res?.modifiedCount ?? res?.nModified) ?? 0

      if (modifiedCount > 0) {
        console.log('[cron] initial markExpired updated items:', modifiedCount)
      } else {
        console.log('[cron] initial markExpired: no expired items')
      }
    } catch (err) {
      console.error('[cron] initial markExpired() failed:', err?.message || err)
    }
  })()

  console.log('[cron] Jobs scheduled for 01:18 PM daily (schedule:', schedule, ' tz:', tz, ')')
}
