// import { chatWithAssistant } from '../ai/chatbotService.js'

// export async function chat(req, res, next) {
//   try {
//     const { messages = [] } = req.body
//     const reply = await chatWithAssistant(req.user.id, messages)
//     res.json({ reply })
//   } catch (err) {
//     next(err)
//   }
// }
// aiController.js
// backend/src/controllers/aiController.js
// src/controllers/aiController.js
// src/controllers/aiController.js
// src/controllers/aiController.js
import { chatWithAssistant } from '../ai/chatbotService.js';

export async function chat(req, res, next) {
  try {
    let { messages } = req.body;
    // Accept plain string or array of messages
    if (!Array.isArray(messages)) {
      messages = typeof messages === 'string' ? [{ role: 'user', content: messages }] : [];
    }
    const result = await chatWithAssistant(req.user.id, messages);
    // result: { structured, text } per chatbotService
    if (result && result.structured) {
      return res.json({ reply: result.text, structured: result.structured });
    }
    // fallback for older version
    const reply = (result && (result.text || result)) || 'Understood.';
    return res.json({ reply: String(reply) });
  } catch (err) {
    console.error('[aiController.chat] error', err);
    return res.status(500).json({ error: 'Unable to process the request right now.' });
  }
}
