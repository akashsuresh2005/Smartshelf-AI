// backend/src/utils/emailTemplates.js

/**
 * Email when item is created/added.
 */
export function buildItemAddedEmail(item) {
  const expiry = item.expiryDate ? new Date(item.expiryDate) : null
  const diffDays = expiry
    ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24))
    : null

  const subject = `SmartShelf – "${item.name}" has been added`

  const textBody = `
Your item "${item.name}" has been added to SmartShelf.

Item details:
- Name       : ${item.name}
- Category   : ${item.category || 'N/A'}
- Quantity   : ${item.quantity || 'N/A'}
- Location   : ${item.location || 'N/A'}
- Added on   : ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
- Expiry date: ${expiry ? expiry.toLocaleDateString() : 'N/A'}
- Days left  : ${diffDays != null ? (diffDays < 0 ? 'Already expired' : diffDays) : 'N/A'}

You will receive reminder emails before this item expires.

— SmartShelf AI
  `.trim()

  const htmlBody = `
    <h2>✅ Item added to SmartShelf</h2>
    <p>Your item <strong>${item.name}</strong> has been added.</p>

    <h3>Item details</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${item.name}</td></tr>
      <tr><td><strong>Category</strong></td><td>${item.category || 'N/A'}</td></tr>
      <tr><td><strong>Quantity</strong></td><td>${item.quantity || 'N/A'}</td></tr>
      <tr><td><strong>Location</strong></td><td>${item.location || 'N/A'}</td></tr>
      <tr><td><strong>Added on</strong></td><td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td><strong>Expiry date</strong></td><td>${expiry ? expiry.toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td><strong>Days left</strong></td><td>${diffDays != null ? (diffDays < 0 ? 'Already expired' : diffDays) : 'N/A'}</td></tr>
    </table>

    <p style="margin-top:16px;font-size:12px;color:#666;">
      You will receive reminder emails before this item expires.<br/>
      — SmartShelf AI
    </p>
  `

  return { subject, textBody, htmlBody }
}

/**
 * Email when item is expiring soon (used by cron job).
 */
export function buildExpiryEmail(item) {
  const now = new Date()
  const expiry = new Date(item.expiryDate)
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

  const subject = `SmartShelf – ${item.name} expires in ${diffDays} day(s)`

  let suggestion
  if (diffDays < 0) {
    suggestion = 'This item is already expired. Please discard it safely.'
  } else if (diffDays === 0) {
    suggestion = 'Use this item today or discard it if it looks or smells unusual.'
  } else if (diffDays <= 2) {
    suggestion = 'Plan a meal in the next 1–2 days that uses this item so it does not go to waste.'
  } else {
    suggestion = 'Keep this item near the front of your shelf so you remember to use it soon.'
  }

  const textBody = `
Your item "${item.name}" is expiring soon.

Item details:
- Name       : ${item.name}
- Category   : ${item.category || 'N/A'}
- Quantity   : ${item.quantity || 'N/A'}
- Location   : ${item.location || 'N/A'}
- Added on   : ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
- Expiry date: ${expiry.toLocaleDateString()}
- Days left  : ${diffDays < 0 ? 'Already expired' : diffDays}

Suggestion:
${suggestion}

This reminder was sent by SmartShelf so you can reduce food waste and save money.
  `.trim()

  const htmlBody = `
    <h2>🕒 Item expiring soon</h2>
    <p>Your item <strong>${item.name}</strong> is close to its expiry date.</p>

    <h3>Item details</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${item.name}</td></tr>
      <tr><td><strong>Category</strong></td><td>${item.category || 'N/A'}</td></tr>
      <tr><td><strong>Quantity</strong></td><td>${item.quantity || 'N/A'}</td></tr>
      <tr><td><strong>Location</strong></td><td>${item.location || 'N/A'}</td></tr>
      <tr><td><strong>Added on</strong></td><td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td><strong>Expiry date</strong></td><td>${expiry.toLocaleDateString()}</td></tr>
      <tr><td><strong>Days left</strong></td><td>${diffDays < 0 ? 'Already expired' : diffDays}</td></tr>
    </table>

    <h3>Suggestion 💡</h3>
    <p>${suggestion}</p>

    <p style="margin-top:16px;font-size:12px;color:#666;">
      — SmartShelf AI • Helping you track what’s in your shelf
    </p>
  `

  return { subject, textBody, htmlBody }
}
