// // server.js
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import express from 'express';
// import cors from 'cors';
// import morgan from 'morgan';
// import cookieParser from 'cookie-parser';
// import { connectDB } from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import itemRoutes from './routes/itemRoutes.js';
// import analyticsRoutes from './routes/analyticsRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';
// import aiRoutes from './routes/aiRoutes.js';
// import reminderRoutes from './routes/reminderRoutes.js';
// import pushRoutes from './routes/pushRoutes.js';
// import activityRoutes from './routes/activityRoutes.js';
// import settingsRoutes from './routes/settingsRoutes.js';
// import { errorHandler } from './middleware/errorHandler.js';
// import { initCronJobs } from './utils/cronJobs.js';

// // fetch for Node < 18
// import fetch from 'node-fetch';

// // For diagnostics
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// const app = express();

// /** --- Startup diagnostics --- */
// console.log('[BOOT] FRONTEND_URL:', process.env.FRONTEND_URL || '(not set)');
// console.log('[BOOT] GEMINI_API_KEY present:', Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY));
// console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV || 'dev');

// app.use(express.json({ limit: '1mb' }));
// app.use(cookieParser());

// /** CORS */
// const allowedOrigins = [
//   process.env.FRONTEND_URL || 'http://localhost:5173',
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
//   'http://localhost:5173',
//   'http://127.0.0.1:5173'
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true);
//       if (allowedOrigins.includes(origin)) return cb(null, true);
//       return cb(new Error('Not allowed by CORS'));
//     },
//     credentials: true
//   })
// );

// app.use(morgan('dev'));

// /** Serve static files */
// const publicDir = path.resolve(process.cwd(), 'public');
// app.use(express.static(publicDir));
// app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

// /** Health check */
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' });
// });

// /** Routes */
// app.use('/api/auth', authRoutes);
// app.use('/api/items', itemRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/ai', aiRoutes);
// app.use('/api/reminders', reminderRoutes);
// app.use('/api/push', pushRoutes);
// app.use('/api/activity', activityRoutes);
// app.use('/api/users', settingsRoutes);

// /* ---------------------------------------------------------------------
//    TEMPORARY ROUTE:  /api/ai/models
//    Lists available Gemini models using REST API. This is ONLY for testing.
//    Remove later if you want. Does NOT affect your AI or other features.
// ------------------------------------------------------------------------*/
// app.get('/api/ai/models', async (req, res) => {
//   try {
//     const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
//     if (!key) return res.status(400).json({ error: 'No GEMINI_API_KEY/GOOGLE_API_KEY configured' });

//     const base = 'https://generativelanguage.googleapis.com/v1/models';

//     // Try the default ?key= API style
//     let response = await fetch(`${base}?key=${encodeURIComponent(key)}`, { method: 'GET' });
//     let body = await response.json();

//     // If key must be in Authorization header
//     if (response.status === 401 || response.status === 403) {
//       response = await fetch(base, {
//         method: 'GET',
//         headers: { Authorization: `Bearer ${key}` }
//       });
//       body = await response.json();
//     }

//     return res.json({
//       status: response.status,
//       models: body
//     });

//   } catch (err) {
//     console.error('[AI models route] error:', err?.message || err);
//     return res.status(500).json({ error: String(err?.message || err) });
//   }
// });
// /* --------------------------------------------------------------------- */


// /** 404 handler */
// app.use((req, res) => {
//   res.status(404).json({ error: 'Not found' });
// });

// /** Central error handler */
// app.use(errorHandler);

// /** Start server */
// const port = process.env.PORT || 5000;

// connectDB()
//   .then(() => {
//     initCronJobs();
//     app.listen(port, () => {
//       console.log(`Smart Shelf AI API running on http://localhost:${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Failed to start server:', err?.message || err);
//     process.exit(1);
//   });

// export default app;
// server.js
// backend/src/server.js
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

import aiSearchRoute from './routes/aiSearch.js';
import chatbotRoute from './routes/chatbot.js';

import { errorHandler } from './middleware/errorHandler.js';
import { initCronJobs } from './utils/cronJobs.js';

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
app.use(cookieParser());
app.use(morgan('dev'));

/* ===================== */
/* ✅ CORS CONFIG (NODE 22 SAFE) */
/* ===================== */
const allowedOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server-to-server
      if (allowedOrigins.includes(origin)) {
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









app.get("/api/test-email", async (req, res) => {
  try {
    const transporter = (await import("./utils/mailer.js")).default;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "SmartShelf Email Test",
      text: "If you see this, Gmail App Password is working."
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[EMAIL TEST ERROR]", err);
    res.status(500).json({ error: err.message });
  }
});
















app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', settingsRoutes);

app.use('/api/items', aiSearchRoute);
app.use('/api/chat', chatbotRoute);

/* ===================== */
/* 404 HANDLER */
/* ===================== */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/* ===================== */
/* CENTRAL ERROR HANDLER */
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
