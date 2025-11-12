import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const in3 = new Date();
    in3.setDate(now.getDate() + 3);

    const items = await Item.find({
      userId: req.user.id,
      status: { $ne: 'consumed' },
      expiryDate: { $gte: now, $lte: in3 }
    }).sort({ expiryDate: 1 });

    res.json(items);
  } catch (err) {
    next(err);
  }
});

export default router;
