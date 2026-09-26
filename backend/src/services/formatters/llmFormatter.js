// services/formatters/llmFormatter.js
import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";

const API_KEY = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
let GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function normalizeModelName(m) {
  if (!m || typeof m !== "string") return "gemini-2.0-flash";
  return m.replace(/^models\//i, "").trim();
}
GEMINI_MODEL = normalizeModelName(GEMINI_MODEL);

// Prompt wrapper
const wrapPrompt = (userMessage) => {
  const safeMsg = (userMessage ?? "").toString().trim();
  return `
You are SmartShelf AI — an intelligent, proactive inventory and food freshness assistant.

You MUST follow this exact structure:

Summary: <one crisp summary line>

Details:
• <bullet 1>
• <bullet 2>
• <bullet 3>
• <bullet 4>

Suggested actions:
1. <action 1>
2. <action 2>
3. <action 3>

Voice Rules:
- Never say "sorry" or apologize.
- Never invent database items.
- For general questions (recipes, storage tips, freshness advice), provide practical, clear knowledge.
- Keep bullets concise and high-value.

User message:
"${safeMsg}"
`.trim();
};

function extractTextFromCandidate(candidate) {
  if (!candidate) return "";

  // 1) Newer shape: candidate.content.parts
  try {
    const parts = candidate?.content?.parts;
    if (Array.isArray(parts) && parts.length) {
      const textParts = parts
        .map((p) => {
          if (typeof p === "string") return p;
          if (p && typeof p.text === "string") return p.text;
          return "";
        })
        .filter(Boolean);
      if (textParts.length) return textParts.join("\n\n").trim();
    }
  } catch (e) {}

  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  if (typeof candidate.text === "string" && candidate.text.trim()) return candidate.text.trim();

  return "";
}

/**
 * Smart built-in assistant fallback when Gemini API key is missing, invalid, or offline
 */
function getSmartAssistantFallback(message) {
  const q = (message || "").toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|greetings|hola|good\s*(morning|afternoon|evening))\b/i.test(q)) {
    return (
      "Summary: Hello! I'm your SmartShelf AI assistant.\n\n" +
      "Details:\n" +
      "• I monitor your groceries, medicines, and perishables.\n" +
      "• Ask me about items expiring soon, storage tips, or recipe ideas.\n" +
      "• Search inventory by asking e.g. \"what expires in 3 days\" or \"where is milk\".\n\n" +
      "Suggested actions:\n" +
      "1. Ask: \"What is expiring soon?\"\n" +
      "2. Ask: \"Give me a quick dinner recipe\"\n" +
      "3. Ask: \"How should I store dairy products?\"\n\n" +
      "source: SmartShelf AI"
    );
  }

  // Recipes
  if (/recipe|cook|dinner|lunch|breakfast|meal|dish|what can i make/i.test(q)) {
    return (
      "Summary: SmartShelf AI recipe & cooking suggestions.\n\n" +
      "Details:\n" +
      "• Check your expiring vegetables and dairy first to prevent food waste.\n" +
      "• Combine near-expiry vegetables into quick stir-fries, soups, or pasta.\n" +
      "• Use ripe fruits in smoothies, oatmeal bowls, or bake into pancakes.\n" +
      "• Store leftovers in airtight containers for up to 3 days.\n\n" +
      "Suggested actions:\n" +
      "1. Check Dashboard for items expiring within 3 days.\n" +
      "2. Ask: \"What items are expiring in 7 days?\"\n" +
      "3. Mark consumed items as used in Dashboard.\n\n" +
      "source: SmartShelf AI"
    );
  }

  // Storage / Freshness
  if (/store|storage|fresh|fridge|freezer|preserve|shelf life/i.test(q)) {
    return (
      "Summary: Optimal storage tips to maximize freshness.\n\n" +
      "Details:\n" +
      "• Dairy & Milk: Keep on middle fridge shelves (around 3-4°C), not in door bins.\n" +
      "• Leafy greens: Wrap in paper towels inside perforated bags to absorb moisture.\n" +
      "• Medicines: Store in a dry, cool cabinet away from bathroom humidity.\n" +
      "• Bread & Bakery: Keep at room temperature or freeze; avoid refrigerating to prevent staling.\n\n" +
      "Suggested actions:\n" +
      "1. Update item storage location in your Shelf.\n" +
      "2. Set custom reminder times for temperature-sensitive items.\n" +
      "3. Check medicine cabinet inventory regularly.\n\n" +
      "source: SmartShelf AI"
    );
  }

  // General helpful response
  return (
    `Summary: SmartShelf AI assistant response for "${message.slice(0, 35)}...".\n\n` +
    "Details:\n" +
    "• I can track all your shelf items, expiration dates, and quantities.\n" +
    "• You can search by item name, brand, barcode, or expiration timeline.\n" +
    "• Real-time notifications and alerts help you avoid food waste.\n\n" +
    "Suggested actions:\n" +
    "1. Query: \"What expires this week?\"\n" +
    "2. Query: \"Where is my medicine stored?\"\n" +
    "3. Add new items via the Add Item page or Barcode scanner.\n\n" +
    "source: SmartShelf AI"
  );
}

export default async function llmFormatter(userMessage) {
  // If API key is empty or placeholder, use smart local assistant engine
  if (!API_KEY || API_KEY.startsWith("AIzaSyAExcVQOE51RRpwBl69LvPzE55vyaIF354")) {
    return getSmartAssistantFallback(userMessage);
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: wrapPrompt(userMessage) }]
      }
    ]
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("[LLM Formatter] failed to parse JSON response:", parseErr);
      data = null;
    }

    if (!response.ok) {
      console.warn(`[LLM Formatter] Gemini API responded with status ${response.status}`, data?.error?.message || "");
      return getSmartAssistantFallback(userMessage);
    }

    const candidate = data?.candidates?.[0];
    const extracted = extractTextFromCandidate(candidate);

    if (extracted && typeof extracted === "string" && extracted.trim()) {
      return extracted.trim();
    }

    return getSmartAssistantFallback(userMessage);
  } catch (err) {
    console.error("[LLM Formatter Error]", err?.message || err);
    return getSmartAssistantFallback(userMessage);
  }
}
