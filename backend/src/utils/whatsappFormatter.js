import { getAISuggestion } from './aiSuggestion.js';

// ✅ FIXED EXPORT (ESM)
export function buildWhatsAppMessage(item) {
  return `
🛒 *SMARTSHELF AI ALERT*

━━━━━━━━━━━━━━━━━━
📦 *Product:* ${item.name}
📅 *Expiry:* ${formatDate(item.expiryDate)}
📊 *Quantity:* ${item.quantity || "N/A"}
⚠️ *Risk Level:* ${item.riskLevel || "LOW"}
━━━━━━━━━━━━━━━━━━

${getAlertText(item)}

💡 *What to do:*
${getSuggestion(item)}

🧠 *AI Suggestion:*
${getAISuggestion(item)}

🛍️ *Where to Buy:*
Amazon / Blinkit / Local Store

📦 *Storage Tip:*
${getStorageTip(item)}

━━━━━━━━━━━━━━━━━━
🤖 SmartShelf AI

Reply:
USED / REMIND
`;
}

/* ---------------- HELPERS ---------------- */

function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

function getAlertText(item) {
  if (item.riskLevel === "HIGH") return "🔴 *ALERT:* Expiring soon!";
  if (item.riskLevel === "MEDIUM") return "🟡 *ALERT:* Use soon";
  return "🟢 *ALERT:* Safe";
}

function getSuggestion(item) {
  if (item.riskLevel === "HIGH") {
    return "Use immediately or discard";
  }
  if (item.riskLevel === "MEDIUM") {
    return "Plan usage soon to avoid waste";
  }
  return "Safe for now";
}

function getStorageTip(item) {
  return "Keep refrigerated for longer life";
}