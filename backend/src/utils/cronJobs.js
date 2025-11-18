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
import cron from 'node-cron'
import Item from '../models/Item.js'
import { sendPushToUser } from '../utils/push.js'
import { sendEmail } from './mailer.js'
import Notification from '../models/Notification.js'
import { markExpired } from '../controllers/itemController.js' // use controller function to mark expired

/**
 * initCronJobs()
 * - Uses CRON_SCHEDULE env var (optional)
 * - Default: run daily at 09:00 (server timezone) => '0 9 * * *'
 * - For testing set CRON_SCHEDULE='* * * * *' to run every minute.
 *
 * NOTE: This function also triggers one immediate run of markExpired() at startup
 * so items that are already past-due are fixed without waiting for the first tick.
 */
export function initCronJobs() {
  const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';

  const tz = process.env.CRON_TZ || 'UTC'
  console.log('[cron] starting expiry cron with schedule:', schedule, 'tz:', tz)

  // Schedule the recurring job
  cron.schedule(
    schedule,
    async () => {
      console.log('[cron] CRON tick - start:', new Date().toISOString())
      try {
        console.log('[cron] Running markExpired() to update past-due items to "expired"...')
        const res = await markExpired() // programmatic call (no req/res)
        // only log if something changed to avoid noise
        const modifiedCount = (res && (res.modifiedCount ?? res.nModified)) ?? 0
        if (modifiedCount > 0) {
          console.log('[cron] markExpired result:', modifiedCount)
        } else {
          console.debug && console.debug('[cron] markExpired ran, no items modified')
        }
      } catch (err) {
        console.error('[cron] markExpired() failed:', err?.message || err)
      }

      // existing notification logic (changed to be idempotent and mark notified after success)
      try {
        console.log('[cron] Checking expiring items (next 7 days)...')
        const now = new Date()
        const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const expiringItems = await Item.find({
          status: 'active',
          expiryDate: { $gte: now, $lte: in7 },
          notified: { $ne: true }
        }).lean()

        console.log('[cron] found', expiringItems.length, 'expiring items')

        for (const item of expiringItems) {
          try {
            const userId = item.userId
            const title = `Expiry alert: ${item.name}`
            const body = `${item.name} expires on ${new Date(item.expiryDate).toLocaleDateString()}`

            // idempotent creation: check first
            const exists = await Notification.findOne({
              userId,
              itemId: item._id,
              type: 'push',
              title
            }).lean()

            if (!exists) {
              try {
                await Notification.create({
                  userId,
                  itemId: item._id,
                  title,
                  message: body,
                  type: 'push'
                })
              } catch (e) {
                // duplicate key error due to race — ignore
                if (e && e.code === 11000) {
                  console.warn('[cron] notification duplicate detected (ignored)', item._id)
                } else {
                  console.warn('[cron] warning notification save failed', e?.message || e)
                }
              }
            } else {
              console.debug && console.debug('[cron] notification already exists; skipping create for', item._id)
            }

            // Try to send push/email. Mark item.notified only after successful push send.
            let notifiedOk = false
            try {
              await sendPushToUser(userId, title, body)
              notifiedOk = true
            } catch (e) {
              console.error('[cron] push send error for item', item._id, e && e.statusCode || e)
              notifiedOk = false
            }

            if (item.email && notifiedOk) {
              try {
                await sendEmail(item.email, title, body)
              } catch (e) {
                console.warn('[cron] email send warning', e?.message || e)
              }
            }

            if (notifiedOk) {
              await Item.updateOne({ _id: item._id }, { $set: { notified: true, notifiedAt: new Date() } })
              console.log('[cron] marked item notified', item._id)
            } else {
              console.log('[cron] did not mark item notified (send failed)', item._id)
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

  // Immediate one-off run at startup so already-past items update right away
  ;(async () => {
    try {
      console.log('[cron] Initial one-off markExpired() at startup:', new Date().toISOString())
      const res = await markExpired()
      const modifiedCount = (res && (res.modifiedCount ?? res.nModified)) ?? 0
      if (modifiedCount > 0) {
        console.log('[cron] initial markExpired result:', modifiedCount)
      } else {
        console.debug && console.debug('[cron] initial markExpired ran, no items modified')
      }
    } catch (err) {
      console.error('[cron] initial markExpired() failed at startup:', err?.message || err)
    }
  })()

  console.log('[cron] Jobs scheduled: expiry/notify (schedule:', schedule, ' tz:', tz, ')')
}

