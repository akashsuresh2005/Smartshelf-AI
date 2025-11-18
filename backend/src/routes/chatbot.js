// routes/chatbot.js
import express from "express";
import axios from "axios";
import llmFormatter from "../services/formatters/llmFormatter.js";

const router = express.Router();

// helper to call local ai-search
async function searchDB(userId, message) {
  try {
    const resp = await axios.post("http://localhost:5000/api/items/ai-search", {
      userId,
      query: message
    });
    return resp.data;
  } catch (err) {
    console.error("[chatbot] ai-search error:", err.message);
    return { found: false };
  }
}

router.post("/", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.send("Summary: Missing userId or message.\n\nsource: SmartShelf AI");
  }

  // 1) FAST PATH → Try database first
  const ai = await searchDB(userId, message);

  if (ai.found) {
    const item = ai.item;

    const summary = `Summary: ${item.name} — expires on ${
      item.expiryDate
        ? new Date(item.expiryDate).toLocaleDateString()
        : "no expiry recorded"
    }.`;

    const details = `
Details:
• Brand: ${item.brand || "—"}
• Quantity: ${item.quantity ?? "—"} ${item.unit || ""}
• Location: ${item.location || "—"}
• Status: ${item.status || "—"}`;

    const actions = `
Suggested actions:
1. Mark as consumed — POST /api/items/${item.id}/consume
2. Edit expiry — UI: Items → ${item.name} → Edit
3. Set reminder — UI: Reminders → Add Reminder`;

    return res.send(`${summary}
${details}

${actions}

source: SmartShelf DB`);
  }

  // 2) FALLBACK → Send to LLM for recipes, tips, suggestions
  const llmReply = await llmFormatter(message);
  return res.send(llmReply);
});

export default router;
