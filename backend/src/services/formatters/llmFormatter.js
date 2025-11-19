// services/formatters/llmFormatter.js
import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/**
 * Normalize model name: API expects plain "gemini-2.0-flash" (not "models/...")
 */
function normalizeModelName(m) {
  if (!m || typeof m !== "string") return "gemini-2.0-flash";
  return m.replace(/^models\//i, "").trim();
}
GEMINI_MODEL = normalizeModelName(GEMINI_MODEL);

// Prompt wrapper
const wrapPrompt = (userMessage) => {
  const safeMsg = (userMessage ?? "").toString().trim();
  return `
You are SmartShelf AI — a friendly, proactive, confident assistant.

You MUST follow this exact structure:

1) Summary: <one short line>
2) Details:
• <bullet 1>
• <bullet 2>
• <bullet 3>
• <bullet 4> (max 5 bullets)
3) Suggested actions:
1. <action 1>
2. <action 2>
3. <action 3>
4) Optional question: <ask ONE question only IF needed>

Voice Rules:
- Never say "sorry".
- Never apologize.
- Never invent SmartShelf DB values.
- For general questions (recipes, storage tips, suggestions), use general knowledge.
- Keep bullets short.
- Keep the tone helpful and clear.
- Always be confident.

User message:
"${safeMsg}"
`.trim();
};

// Robust extractor for candidate shapes
function extractTextFromCandidate(candidate) {
  if (!candidate) return "";

  // 1) Newer shape: candidate.content.parts
  try {
    const parts = candidate?.content?.parts;
    if (Array.isArray(parts) && parts.length) {
      return parts
        .map((p) => {
          if (typeof p === "string") return p;
          if (p && typeof p === "object") return p.text ?? JSON.stringify(p);
          return String(p);
        })
        .join("\n\n")
        .trim();
    }
  } catch (e) {}

  // 2) Common properties
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  if (typeof candidate.text === "string" && candidate.text.trim()) return candidate.text.trim();
  if (typeof candidate.output === "string" && candidate.output.trim()) return candidate.output.trim();

  // 3) Structured object with summary/details/items
  if (candidate && typeof candidate === "object") {
    const summary = candidate.summary || candidate.title || "";
    const details = candidate.details || candidate.body || candidate.message || "";
    const items = candidate.items;
    const parts = [];
    if (summary) parts.push(String(summary));
    if (details) parts.push(String(details));
    if (Array.isArray(items) && items.length) {
      parts.push("Items: " + items.map((it) => (it.name ? `${it.name}` : JSON.stringify(it))).join(", "));
    }
    const txt = parts.join("\n\n").trim();
    if (txt) return txt;
  }

  // 4) Last resort: JSON stringify
  try {
    return JSON.stringify(candidate, null, 2);
  } catch (e) {
    return String(candidate);
  }
}

export default async function llmFormatter(userMessage) {
  if (!API_KEY) {
    return (
      "Summary: I’m ready to help.\n\n" +
      "Details:\n• Add GEMINI_API_KEY to enable advanced suggestions.\n\n" +
      "Suggested actions:\n1. Add API key.\n2. Try a database query.\n3. Try again.\n\n" +
      "source: SmartShelf AI Local"
    );
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: wrapPrompt(userMessage) }]
      }
    ]
  };

  // Build endpoint (normalized model name)
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
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
      console.warn(`[LLM Formatter] non-OK response: ${response.status} ${response.statusText}`, data || "(no body)");
      // try extract something useful from error or candidate
      const fallbackCandidate = data?.error || data?.candidates?.[0] || data;
      const extracted = extractTextFromCandidate(fallbackCandidate);
      if (extracted) return extracted;
      return (
        "Summary: I’m here but the AI service returned an error.\n\n" +
        "Details:\n• The model may be unavailable or overloaded.\n• Check GEMINI_MODEL and GEMINI_API_KEY settings.\n\n" +
        "Suggested actions:\n1. Try again later.\n2. Use gemini-2.0-flash or gemini-pro.\n3. Verify API key and quotas.\n\n" +
        "source: SmartShelf AI"
      );
    }

    // successful response: extract best candidate
    const candidate = data?.candidates?.[0] ?? data?.output ?? data;
    const extracted = extractTextFromCandidate(candidate);

    const output =
      extracted && typeof extracted === "string" && extracted.trim()
        ? extracted.trim()
        : "Summary: I can help with that.\n\nDetails:\n• Ask me anything.\n\nSuggested actions:\n1. Try again.\n2. Ask about items.\n3. Use SmartShelf actions.\n\nsource: SmartShelf AI";

    return output;
  } catch (err) {
    console.error("[LLM Formatter Error]", err);
    return (
      "Summary: I’m here to help.\n\n" +
      "Details:\n• AI formatting temporarily unavailable.\n• You can still ask about your SmartShelf items.\n\n" +
      "Suggested actions:\n1. Retry.\n2. Ask an item question.\n3. Check connection.\n\n" +
      "source: Local fallback"
    );
  }
}
