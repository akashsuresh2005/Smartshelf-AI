
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// let transporter = null;
// let warned = false;

// function ensureTransporter() {
//   if (transporter) return transporter;
//   const user = process.env.EMAIL_USER;
//   const pass = process.env.EMAIL_PASS;
//   if (!user || !pass) {
//     if (!warned) {
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

// import Activity from '../models/Activity.js'
// import { makeActivityPayload } from './activityHelper.js'

// /**
//  * sendEmail(to, subject, body, [textOverride])
//  *
//  * - If called with 3 args: sendEmail(to, subject, textBody)
//  *   -> treats the 3rd arg as plain text.
//  *
//  * - If called with 4 args: sendEmail(to, subject, htmlBody, textBody)
//  *   -> 3rd = HTML, 4th = plain text.
//  */
// export async function sendEmail(to, subject, body, textOverride) {
//   const tx = ensureTransporter();
//   if (!tx || !to) return; // fail silently if not configured

//   // Determine html/text from args
//   let html = undefined;
//   let text = undefined;

//   if (typeof textOverride !== 'undefined') {
//     // New style: (to, subject, htmlBody, textBody)
//     html = body;
//     text = textOverride;
//   } else {
//     // Old style: (to, subject, textBody)
//     // But if body looks like HTML, we’ll send both html + stripped text.
//     const maybeHtml = typeof body === 'string' && /<[a-z][\s\S]*>/i.test(body);
//     if (maybeHtml) {
//       html = body;
//       text = body.replace(/<[^>]+>/g, '');
//     } else {
//       text = body;
//     }
//   }

//   try {
//     const info = await tx.sendMail({
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       text,
//       html,
//     });

//     // Compose standardized activity payload and store (non-blocking)
//     try {
//       const payload = makeActivityPayload({
//         type: 'mail:sent',
//         message: `Email: ${subject}`,
//         meta: {
//           to: to,
//           subject,
//           text,
//           html: html ? '[html content present]' : null,
//           info: info && info.messageId ? { messageId: info.messageId } : {}
//         },
//         userId: null,
//         userName: String(to)
//       });
//       // fire-and-forget; log failure but don't throw
//       Activity.create(payload).catch(e => {
//         console.warn('[MAILER] Activity logging failed:', e?.message || e);
//       });
//     } catch (e) {
//       console.warn('[MAILER] Activity prepare failed:', e?.message || e);
//     }

//     console.log(`[MAILER] ✅ Email sent to ${to}: ${subject}`);
//     return info;
//   } catch (err) {
//     console.error('[MAILER ERROR] ❌', err?.message || err);
//     throw err;
//   }
// }

// backend/src/utils/mailer.js
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

let transporter = null
let warned = false

function ensureTransporter() {
  if (transporter) return transporter
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass) {
    if (!warned) {
      console.warn('[MAILER] EMAIL_USER or EMAIL_PASS missing — emails will not send.')
      console.warn('[MAILER] Add EMAIL_USER and EMAIL_PASS to your backend .env file.')
      warned = true
    }
    return null
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  })
  return transporter
}

function buildResetEmailHtml(resetUrl) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#1e293b;border-radius:12px;padding:36px;border:1px solid #334155;">
        <tr><td>
          <h1 style="margin:0 0 4px;font-size:22px;color:#22d3ee;font-weight:700;">SmartShelf AI</h1>
          <p style="margin:0 0 28px;font-size:12px;color:#64748b;">Inventory management, reimagined</p>
          <h2 style="margin:0 0 12px;font-size:20px;color:#f1f5f9;font-weight:600;">Reset your password</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
            We received a request to reset the password for your SmartShelf account.
            Click the button below to choose a new password.
            This link expires in <strong style="color:#f1f5f9;">1 hour</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:4px 0 28px;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:linear-gradient(90deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">
                Reset Password
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:12px;color:#64748b;">If the button doesn't work, copy this link:</p>
          <p style="margin:0 0 28px;font-size:11px;word-break:break-all;">
            <a href="${resetUrl}" style="color:#22d3ee;">${resetUrl}</a>
          </p>
          <hr style="border:none;border-top:1px solid #334155;margin:0 0 20px;"/>
          <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
            If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * sendEmail(to, subject, body, textOverride?)
 * - sendEmail(to, subject, textBody)
 * - sendEmail(to, subject, htmlBody, plainTextBody)
 */
export async function sendEmail(to, subject, body, textOverride) {
  const tx = ensureTransporter()
  if (!tx || !to) {
    console.warn('[MAILER] Skipping — transporter not ready or no recipient.')
    return
  }

  let html, text

  if (typeof textOverride !== 'undefined') {
    html = body
    text = textOverride
  } else {
    const isHtml = typeof body === 'string' && /<[a-z][\s\S]*>/i.test(body)
    if (isHtml) {
      html = body
      text = body.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    } else {
      text = body
    }
  }

  try {
    const info = await tx.sendMail({
      from: `"SmartShelf AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    })
    console.log(`[MAILER] ✅ Sent to ${to} — "${subject}"`)
    return info
  } catch (err) {
    console.error('[MAILER] ❌ Failed:', err?.message || err)
    throw err
  }
}

/**
 * sendPasswordResetEmail — dedicated helper with HTML template
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  const subject = 'Reset your SmartShelf password'
  const html = buildResetEmailHtml(resetUrl)
  const text = `Reset your SmartShelf password\n\nClick here: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`
  return sendEmail(to, subject, html, text)
}