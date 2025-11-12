import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { addSubscription } from '../utils/push.js';

const router = Router();

/**
 * Body: { endpoint, keys: { p256dh, auth } }
 * Sent from the browser after subscribing.
 */
router.post('/subscribe', requireAuth, (req, res) => {
  const sub = req.body;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }
  // For demo: in-memory store (you already have this in utils/push.js)
  addSubscription(sub);
  return res.json({ ok: true });
});

export default router;
