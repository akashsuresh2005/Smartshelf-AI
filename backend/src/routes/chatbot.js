// routes/chatbot.js
import express from "express";
import axios from "axios";
import llmFormatter from "../services/formatters/llmFormatter.js";

const router = express.Router();

// helper to call local ai-search (kept simple and local)
async function searchDB(userId, message) {
  try {
    const resp = await axios.post(
      "http://localhost:5000/api/items/ai-search",
      { userId, query: message },
      { timeout: 8000 }
    );
    return resp.data || { found: false };
  } catch (err) {
    console.error("[chatbot] ai-search error:", err?.message || err);
    return { found: false };
  }
}

// Helper to always send plain-text responses (avoid HTML content-type)
function sendPlain(res, text, status = 200) {
  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
  } catch (e) {
    // ignore header set errors (very rare)
  }
  return res.status(status).send(typeof text === "string" ? text : String(text));
}

// Helper: format a single item into the SmartShelf DB text response
function formatSingleItem(item) {
  const summary = `Summary: ${item.name || "Item"} — expires on ${
    item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "no expiry recorded"
  }.`;

  const details = [
    "Details:",
    `• Brand: ${item.brand || "—"}`,
    `• Quantity: ${item.quantity ?? "—"} ${item.unit || ""}`.trim(),
    `• Location: ${item.location || "—"}`,
    `• Status: ${item.status || "—"}`
  ].join("\n");

  const actions = [
    "Suggested actions:",
    `1. Mark as consumed — POST /api/items/${item.id}/consume`,
    `2. Edit expiry — UI: Items → ${item.name || "Item"} → Edit`,
    "3. Set reminder — UI: Reminders → Add Reminder"
  ].join("\n");

  return `${summary}\n\n${details}\n\n${actions}\n\nsource: SmartShelf DB`;
}

// Helper: format items list (expiry intent) into readable text
function formatItemsList(items = [], days = null) {
  const title = days != null
    ? `Summary: Found ${items.length} item(s) expiring within ${days} day(s).`
    : `Summary: Found ${items.length} item(s).`;

  const detailsLines = items.map((it, idx) => {
    const d = it.expiryDate ? new Date(it.expiryDate).toLocaleDateString() : "no expiry recorded";
    return `${idx + 1}. ${it.name} — ${it.brand ? `${it.brand} — ` : ""}${d} — ${it.location || "—"} (${it.status || "—"})`;
  });

  const details = ["Details:"].concat(detailsLines).join("\n");

  const actions = [
    "Suggested actions:",
    "1. Open Items → filter by expiry to view details.",
    "2. Edit item expiry or set reminders from item details.",
    "3. Mark consumed if already used."
  ].join("\n");

  return `${title}\n\n${details}\n\n${actions}\n\nsource: SmartShelf DB`;
}

// POST /api/chat
router.post("/", async (req, res) => {
  const { userId, message } = req.body || {};

  console.debug("[ChatBotAssistant] sending chat, userId:", userId);

  if (!userId || !message) {
    const missing = "Summary: Missing userId or message.\n\nsource: SmartShelf AI";
    return sendPlain(res, missing, 200);
  }

  // 1) FAST PATH → Try database search first
  try {
    const ai = await searchDB(userId, message);
    console.debug("[ChatBotAssistant] ai-search result:", ai && (ai.found ? (ai.items ? `items:${ai.items.length}` : 'single item') : 'not found'));

    if (ai && ai.found) {
      // Case A: ai returned an items array (expiry/list queries)
      if (Array.isArray(ai.items) && ai.items.length >= 0) {
        // days info may be present in evidence
        const days = ai.evidence?.days ?? ai.evidence?.queryType === 'expiry' ? (ai.evidence.days ?? null) : null;
        const out = formatItemsList(ai.items, days);
        return sendPlain(res, out, 200);
      }

      // Case B: ai returned a single item object
      if (ai.item) {
        const out = formatSingleItem(ai.item);
        return sendPlain(res, out, 200);
      }

      // Defensive: found true but no usable payload -> return safe message
      const fallback = "Summary: Found matching records but couldn't format the response.\n\nsource: SmartShelf DB";
      return sendPlain(res, fallback, 200);
    }
  } catch (err) {
    // If DB search fails, continue to LLM fallback (we only log)
    console.error("[chatbot] DB fast-path failed:", err?.message || err);
  }

  // 2) FALLBACK → Send to LLM for recipes, tips, suggestions
  try {
    // llmFormatter is expected to return a string (or an object). Coerce safely to string.
    const llmReply = await llmFormatter(message);
    const replyText =
      typeof llmReply === "string"
        ? llmReply
        : llmReply && llmReply.summary
        ? `${llmReply.summary}${llmReply.details ? `\n\n${llmReply.details}` : ""}${
            llmReply.items && llmReply.items.length ? `\n\nFound ${llmReply.items.length} item(s).` : ""
          }`
        : String(llmReply || "Summary: I can help — ask me about items or recipes.");

    console.debug("[ChatBotAssistant] /chat reply:", typeof replyText === "string" ? replyText.slice(0, 200) : "non-string reply");
    return sendPlain(res, replyText, 200);
  } catch (err) {
    console.error("[chatbot] LLM error:", err?.message || err);
    const fallback = "Summary: Something went wrong while generating a response. Please try again.\n\nsource: SmartShelf AI";
    return sendPlain(res, fallback, 200);
  }
});

export default router;
