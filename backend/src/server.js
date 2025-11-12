// backend/src/server.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from the same folder as this file (backend/src/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initCronJobs } from './utils/cronJobs.js';
// ...existing imports...
import pushRoutes from './routes/pushRoutes.js';


const app = express();

/** --- Startup diagnostics --- */
console.log('[BOOT] FRONTEND_URL:', process.env.FRONTEND_URL || '(not set)');
console.log('[BOOT] GEMINI_API_KEY present:', Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY));
console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV || 'dev');

/** Body parsing */
app.use(express.json({ limit: '1mb' }));

/** CORS: allow configured FE + common local dev origins */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients (no Origin) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

/** Logging */
app.use(morgan('dev'));

/** Health check */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' });
});

/** Routes */
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', reminderRoutes);

app.use('/api/push', pushRoutes);

/** 404 for unknown routes (before error handler) */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/** Central error handler (must be last) */
app.use(errorHandler);

/** Bootstrap */
const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    initCronJobs();
    app.listen(port, () => {
      console.log(`Smart Shelf AI API running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err?.message || err);
    process.exit(1);
  });

export default app;
