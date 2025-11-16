// import cron from 'node-cron'
// import Item from '../models/Item.js'
// import Notification from '../models/Notification.js'
// import { sendEmail } from './mailer.js'
// import { sendPushToAll } from './push.js'

// export function initCronJobs() {
//   // Runs every day at 9:00 AM
//   cron.schedule('0 9 * * *', async () => {
//     try {
//       const now = new Date()
//       const soonItems = await Item.find({ status: 'active' })
//       for (const i of soonItems) {
//         const diffDays = Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24))
//         if (diffDays <= 3 && diffDays >= 0) {
//           const title = 'Daily reminder: expiring soon'
//           const message = `${i.name} expires in ${diffDays} day(s).`
//           await Notification.create({ userId: i.userId, itemId: i._id, title, message, type: 'email' })
//           // You might need to fetch the user's email via populate; omitted for brevity
//           sendPushToAll(title, message).catch(() => {})
//         } else if (diffDays < 0 && i.status !== 'expired') {
//           i.status = 'expired'
//           await i.save()
//         }
//       }
//       console.log('Cron job executed: expiry checks')
//     } catch (err) {
//       console.error('Cron error:', err.message)
//     }
//   })
// }
// src/utils/cronJobs.js
import cron from 'node-cron';
import Item from '../models/Item.js';
import { sendPushToUser } from '../utils/push.js';
import { sendEmail } from './mailer.js';
import Notification from '../models/Notification.js';

/**
 * initCronJobs()
 * - Uses CRON_SCHEDULE env var (optional)
 * - Default: run daily at 09:00 (server timezone) => '0 9 * * *'
 * - For testing set CRON_SCHEDULE='* * * * *' to run every minute.
 */
export function initCronJobs() {
  const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
  console.log('[cron] starting expiry cron with schedule:', schedule);

  cron.schedule(schedule, async () => {
    console.log('[cron] Checking expiring items...');
    try {
      const now = new Date();
      const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Find active items expiring within 7 days and not notified yet
      const expiringItems = await Item.find({
        status: 'active',
        expiryDate: { $gte: now, $lte: in7 },
        notified: { $ne: true }
      }).lean();

      console.log('[cron] found', expiringItems.length, 'expiring items');

      for (const item of expiringItems) {
        try {
          const userId = item.userId;
          const title = `Expiry alert: ${item.name}`;
          const body = `${item.name} expires on ${new Date(item.expiryDate).toLocaleDateString()}`;

          // Persist a Notification record for history (non-blocking)
          await Notification.create({
            userId,
            itemId: item._id,
            title,
            message: body,
            type: 'push'
          }).catch(e => console.warn('[cron] warning notification save failed', e?.message || e));

          // Send push to specific user
          await sendPushToUser(userId, title, body).catch(e => {
            console.error('[cron] push send error for item', item._id, e && e.statusCode || e);
          });

          // Optionally send email too (keep original behavior)
          try {
            const emailsent = await sendEmail(item.email || null, title, body).catch(() => {});
            // ignore if email not configured
          } catch {}

          // Mark as notified so we don't spam users; update item (set notified true)
          await Item.updateOne({ _id: item._id }, { $set: { notified: true, notifiedAt: new Date() } });
          console.log('[cron] marked item notified', item._id);
        } catch (inner) {
          console.error('[cron] error processing item', item._id, inner);
        }
      }
    } catch (err) {
      console.error('[cron] failure', err);
    }
    console.log('[cron] Done.');
  }, { timezone: process.env.CRON_TZ || 'UTC' });
}
