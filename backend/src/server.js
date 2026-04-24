import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import whatsappRoutes from './routes/whatsAppRoutes.js';

import aiSearchRoute from './routes/aiSearch.js';
import chatbotRoute from './routes/chatbot.js';

import { errorHandler } from './middleware/errorHandler.js';
import { initCronJobs } from './utils/cronJobs.js';
import { sendEmail } from './utils/mailer.js';

/* ===================== */
/* ENV SETUP */
/* ===================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

/* ===================== */
/* BOOT LOGS */
/* ===================== */
console.log('[BOOT] FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV || 'development');

/* ===================== */
/* MIDDLEWARE */
/* ===================== */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));

/* ===================== */
/* DEBUG WHATSAPP REQUESTS */
/* ===================== */
app.use((req, res, next) => {
  if (req.originalUrl.includes('/api/whatsapp')) {
    console.log('[WHATSAPP WEBHOOK]', req.body);
  }
  next();
});

/* ===================== */
/* CORS CONFIG */
/* ===================== */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);

      // ✅ Allow any localhost or 127.0.0.1 port dynamically (5173, 5174, etc.)
      if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }

      // Allow production frontend URL from .env if set
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

/* ===================== */
/* ROUTES */
/* ===================== */

app.get('/', (req, res) => {
  res.send('SmartShelf AI Backend Running 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

/* ===================== */
/* EMAIL TEST */
/* ===================== */
app.get('/api/test-email', async (req, res) => {
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      'SmartShelf Email Test',
      'If you see this, email is working.'
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[EMAIL TEST ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

/* ===================== */
/* MAIN ROUTES */
/* ===================== */

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', settingsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/items', aiSearchRoute);
app.use('/api/chat', chatbotRoute);

/* ===================== */
/* 404 HANDLER */
/* ===================== */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/* ===================== */
/* ERROR HANDLER */
/* ===================== */
app.use(errorHandler);

/* ===================== */
/* START SERVER */
/* ===================== */

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    initCronJobs();
    app.listen(port, '0.0.0.0', () => {
      console.log(`SmartShelf AI API running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err?.message || err);
    process.exit(1);
  });

export default app;