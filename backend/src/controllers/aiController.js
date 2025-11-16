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
import { chatWithAssistant } from '../ai/chatbotService.js';

export async function chat(req, res, next) {
  try {
    let { messages } = req.body;
    // Accept a plain string or an array of message objects
    if (!Array.isArray(messages)) {
      messages = typeof messages === 'string' ? [{ role: 'user', content: messages }] : [];
    }
    const reply = await chatWithAssistant(req.user.id, messages);
    res.json({ reply: String(reply) });
  } catch (err) {
    next(err);
  }
}


