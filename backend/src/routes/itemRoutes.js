
// import { Router } from 'express';
// import { addItem, getItems, updateItem, deleteItem } from '../controllers/itemController.js';
// import { requireAuth } from '../middleware/authMiddleware.js';

// const router = Router();

// // Legacy-style endpoints (if anything still uses /add, /get, etc.)
// router.post('/add', requireAuth, addItem);
// router.get('/get', requireAuth, getItems);
// router.put('/update/:id', requireAuth, updateItem);
// router.delete('/delete/:id', requireAuth, deleteItem);

// // RESTful aliases used by your current UI
// router.post('/', requireAuth, addItem);
// router.get('/', requireAuth, getItems);
// router.put('/:id', requireAuth, updateItem);
// router.delete('/:id', requireAuth, deleteItem);

// export default router;

// routes/itemRoutes.js
 // routes/itemRoutes.js
import { Router } from 'express';
import { addItem, getItems, updateItem, deleteItem } from '../controllers/itemController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import axios from 'axios'; // Ensure you have axios installed

const router = Router();

// RESTful endpoints
router.post('/', requireAuth, addItem);
router.get('/', requireAuth, getItems);
router.put('/:id', requireAuth, updateItem);
router.delete('/:id', requireAuth, deleteItem);

// ✅ NEW: Server-side barcode lookup (Optional fallback)
router.get('/lookup/:barcode', requireAuth, async (req, res) => {
    try {
        const { barcode } = req.params;
        const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product data' });
    }
});

/* Legacy aliases */
router.post('/add', requireAuth, addItem);
router.get('/get', requireAuth, getItems);
router.put('/update/:id', requireAuth, updateItem);
router.delete('/delete/:id', requireAuth, deleteItem);

export default router;
