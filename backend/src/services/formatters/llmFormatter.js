// services/formatters/llmFormatter.js
import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Strict SmartShelf AI prompt
const wrapPrompt = (userMessage) => `
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
- Never say “sorry”.
- Never apologize.
- Never invent SmartShelf DB values.
- For general questions (recipes, storage tips, suggestions), use general knowledge.
- Keep bullets short.
- Keep the tone helpful and clear.
- Always be confident.

User message:
"${userMessage}"
`;

export default async function llmFormatter(userMessage) {
  if (!API_KEY) {
    return "Summary: I’m ready to help.\n\nDetails:\n• Add GEMINI_API_KEY to enable advanced suggestions.\n\nSuggested actions:\n1. Add API key.\n2. Try a database query.\n3. Try again.\n\nsource: SmartShelf AI Local";
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: wrapPrompt(userMessage) }]
      }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Summary: I can help with that.\n\nDetails:\n• Ask me anything.\n\nSuggested actions:\n1. Try again.\n2. Ask about items.\n3. Use SmartShelf actions.\n\nsource: SmartShelf AI";

    return output;
  } catch (err) {
    console.error("[LLM Formatter Error]", err);
    return "Summary: I’m here to help.\n\nDetails:\n• AI formatting temporarily unavailable.\n• You can still ask about your SmartShelf items.\n\nSuggested actions:\n1. Retry.\n2. Ask an item question.\n3. Check connection.\n\nsource: Local fallback";
  }
}
