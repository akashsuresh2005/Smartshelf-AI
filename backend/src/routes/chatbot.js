// routes/chatbot.js
import express from "express";
import axios from "axios";
import llmFormatter from "../services/formatters/llmFormatter.js";

const router = express.Router();

// helper to call local ai-search (kept simple and local)
async function searchDB(userId, message) {
  try {
    const resp = await axios.post("http://localhost:5000/api/items/ai-search", {
      userId,
      query: message
    }, { timeout: 8000 });
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

router.post("/", async (req, res) => {
  const { userId, message } = req.body || {};

  if (!userId || !message) {
    const missing = "Summary: Missing userId or message.\n\nsource: SmartShelf AI";
    return sendPlain(res, missing, 200);
  }

  // 1) FAST PATH → Try database search first
  try {
    const ai = await searchDB(userId, message);

    if (ai && ai.found) {
      const item = ai.item || {};
      const summary = `Summary: ${item.name || "Item"} — expires on ${
        item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "no expiry recorded"
      }.`.trim();

      const details = `
Details:
• Brand: ${item.brand || "—"}
• Quantity: ${item.quantity ?? "—"} ${item.unit || ""}
• Location: ${item.location || "—"}
• Status: ${item.status || "—"}`.trim();

      const actions = `
Suggested actions:
1. Mark as consumed — POST /api/items/${item.id}/consume
2. Edit expiry — UI: Items → ${item.name || "Item"} → Edit
3. Set reminder — UI: Reminders → Add Reminder`.trim();

      const out = `${summary}
${details}

${actions}

source: SmartShelf DB`;

      return sendPlain(res, out, 200);
    }
  } catch (err) {
    // If DB search fails, continue to LLM fallback (we only log)
    console.error("[chatbot] DB fast-path failed:", err?.message || err);
  }

  // 2) FALLBACK → Send to LLM for recipes, tips, suggestions
  try {
    // llmFormatter is expected to return a string (or an object). Coerce safely to string.
    const llmReply = await llmFormatter(message);
    const replyText = typeof llmReply === "string" ? llmReply : (llmReply && llmReply.summary) ? (
      // try to build a nice string if llm returns structured object
      `${llmReply.summary}${llmReply.details ? `\n\n${llmReply.details}` : ""}${llmReply.items && llmReply.items.length ? `\n\nFound ${llmReply.items.length} item(s).` : ""}`
    ) : String(llmReply || "Sorry, I couldn't generate a response right now.");

    return sendPlain(res, replyText, 200);
  } catch (err) {
    console.error("[chatbot] LLM error:", err?.message || err);
    const fallback = "Summary: Something went wrong while generating a response. Please try again.\n\nsource: SmartShelf AI";
    return sendPlain(res, fallback, 200);
  }
});

export default router;
