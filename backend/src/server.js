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
import aiRoutes from './routes/aiRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initCronJobs } from './utils/cronJobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

/** --- Startup diagnostics --- */
console.log('[BOOT] FRONTEND_URL:', process.env.FRONTEND_URL || '(not set)');
console.log('[BOOT] GEMINI_API_KEY present:', Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY));
console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV || 'dev');

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

/** CORS: allow configured FE + common local dev origins */
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser (curl/postman) requests that have no origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(morgan('dev'));

/** Serve static files (public/uploads, assets, etc.) */
const publicDir = path.resolve(process.cwd(), 'public');
app.use(express.static(publicDir));
// make sure uploads are accessible under /uploads/...
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

/** Health check */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' });
});

/** Routes - mount API routers BEFORE the 404 */
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/activity', activityRoutes);

/** SETTINGS: mount settings routes */
app.use('/api/users', settingsRoutes);

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
