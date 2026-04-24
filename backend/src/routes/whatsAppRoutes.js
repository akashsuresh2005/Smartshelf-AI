import express from 'express';
import { handleReply } from '../controllers/whatsappController.js';

const router = express.Router();

router.post('/reply', handleReply);

export default router;