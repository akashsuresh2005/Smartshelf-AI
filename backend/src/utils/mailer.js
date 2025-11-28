// // import nodemailer from 'nodemailer'

// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // })

// // export async function sendEmail(to, subject, text) {
// //   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return
// //   const mailOptions = {
// //     from: process.env.EMAIL_USER,
// //     to,
// //     subject,
// //     text
// //   }
// //   await transporter.sendMail(mailOptions)
// // }
// // backend/src/utils/mailer.js
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Ensure .env is loaded even if this module runs before server.js
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// // .env is at backend/src/.env → go one level up from utils/
// dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// let transporter = null;
// let warned = false;

// function ensureTransporter() {
//   if (transporter) return transporter;

//   const user = process.env.EMAIL_USER;
//   const pass = process.env.EMAIL_PASS;

//   if (!user || !pass) {
//     if (!warned) {
//       // print this once to avoid spam
//       console.warn('[MAILER] EMAIL_USER or EMAIL_PASS is missing — emails will not send.');
//       console.warn('[MAILER] Checked .env at:', path.resolve(__dirname, '..', '.env'));
//     }
//     warned = true;
//     return null;
//   }

//   transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user, pass },
//   });

//   return transporter;
// }

// export async function sendEmail(to, subject, text) {
//   const tx = ensureTransporter();
//   if (!tx || !to) return; // fail silently if not configured

//   try {
//     await tx.sendMail({
//       from: process.env.EMAIL_USER, // must match your Gmail/App Password account
//       to,
//       subject,
//       text,
//     });
//     console.log(`[MAILER] ✅ Email sent to ${to}: ${subject}`);
//   } catch (err) {
//     console.error('[MAILER ERROR] ❌', err?.message || err);
//   }
// }
// backend/src/utils/mailer.js
// backend/src/utils/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

let transporter = null;
let warned = false;

function ensureTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    if (!warned) {
      console.warn('[MAILER] EMAIL_USER or EMAIL_PASS is missing — emails will not send.');
      console.warn('[MAILER] Checked .env at:', path.resolve(__dirname, '..', '.env'));
    }
    warned = true;
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return transporter;
}

import Activity from '../models/Activity.js'
import { makeActivityPayload } from './activityHelper.js'

/**
 * sendEmail(to, subject, body, [textOverride])
 *
 * - If called with 3 args: sendEmail(to, subject, textBody)
 *   -> treats the 3rd arg as plain text.
 *
 * - If called with 4 args: sendEmail(to, subject, htmlBody, textBody)
 *   -> 3rd = HTML, 4th = plain text.
 */
export async function sendEmail(to, subject, body, textOverride) {
  const tx = ensureTransporter();
  if (!tx || !to) return; // fail silently if not configured

  // Determine html/text from args
  let html = undefined;
  let text = undefined;

  if (typeof textOverride !== 'undefined') {
    // New style: (to, subject, htmlBody, textBody)
    html = body;
    text = textOverride;
  } else {
    // Old style: (to, subject, textBody)
    // But if body looks like HTML, we’ll send both html + stripped text.
    const maybeHtml = typeof body === 'string' && /<[a-z][\s\S]*>/i.test(body);
    if (maybeHtml) {
      html = body;
      text = body.replace(/<[^>]+>/g, '');
    } else {
      text = body;
    }
  }

  try {
    const info = await tx.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    // Compose standardized activity payload and store (non-blocking)
    try {
      const payload = makeActivityPayload({
        type: 'mail:sent',
        message: `Email: ${subject}`,
        meta: {
          to: to,
          subject,
          text,
          html: html ? '[html content present]' : null,
          info: info && info.messageId ? { messageId: info.messageId } : {}
        },
        userId: null,
        userName: String(to)
      });
      // fire-and-forget; log failure but don't throw
      Activity.create(payload).catch(e => {
        console.warn('[MAILER] Activity logging failed:', e?.message || e);
      });
    } catch (e) {
      console.warn('[MAILER] Activity prepare failed:', e?.message || e);
    }

    console.log(`[MAILER] ✅ Email sent to ${to}: ${subject}`);
    return info;
  } catch (err) {
    console.error('[MAILER ERROR] ❌', err?.message || err);
    throw err;
  }
}

