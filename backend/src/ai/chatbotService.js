import Item from '../models/Item.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

let _genAI = null;
let _genKeySeen = null;
let _modelId = null; // cache the first working model

function getGenAI() {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  if (!_genAI || _genKeySeen !== key) {
    if (!key) {
      console.warn('[AI] No GEMINI_API_KEY/GOOGLE_API_KEY found at runtime.');
      _genAI = null; _genKeySeen = null; _modelId = null;
      return null;
    }
    _genAI = new GoogleGenerativeAI(key);
    _genKeySeen = key;
    _modelId = null; // reset if key changes
    console.log('[AI] Gemini client initialized.');
  }
  return _genAI;
}

// Pick a working model (try a few IDs commonly enabled)
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,           // allow override via .env
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.0-pro',
  'gemini-pro'
].filter(Boolean);

async function generateWithFallback(genAI, prompt) {
  // Use cached model if already found
  if (_modelId) {
    const model = genAI.getGenerativeModel({ model: _modelId });
    const res = await model.generateContent(prompt);
    return res;
  }
  // Try candidates until one works, then cache it
  let lastErr;
  for (const id of MODEL_CANDIDATES) {
    try {
      console.log('[AI] Trying model:', id);
      const model = genAI.getGenerativeModel({ model: id });
      const res = await model.generateContent(prompt);
      _modelId = id;
      console.log('[AI] Selected model:', id);
      return res;
    } catch (e) {
      lastErr = e;
      // Only log 404s briefly (expected when model not available)
      const msg = String(e?.message || e);
      if (msg.includes('404') || msg.includes('not found')) {
        console.warn('[AI] Model not available:', id);
      } else {
        console.error('[AI] Model error for', id, ':', msg);
      }
    }
  }
  throw lastErr || new Error('No Gemini models available');
}

// ---------- helpers below unchanged ----------
function getLastUserText(messages) {
  try {
    if (!Array.isArray(messages) || messages.length === 0) return '';
    const last = messages[messages.length - 1];
    if (typeof last === 'string') return last;
    if (last && typeof last === 'object') {
      if (typeof last.content === 'string') return last.content;
      if (typeof last.text === 'string') return last.text;
      if (Array.isArray(last.parts) && last.parts[0]?.text) return last.parts[0].text;
    }
  } catch {}
  return '';
}

async function buildInventoryContext(userId) {
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [soonItems, totals] = await Promise.all([
    Item.find({ userId, expiryDate: { $gte: now, $lte: soon }, status: { $ne: 'consumed' } })
      .sort({ expiryDate: 1 })
      .limit(10)
      .lean(),
    Item.aggregate([{ $match: { userId } }, { $group: { _id: '$category', count: { $sum: 1 } } }])
  ]);
  const soonList = soonItems.map(i => `${i.name} (${i.category}) – ${new Date(i.expiryDate).toLocaleDateString()}`).join('\n');
  const counts = totals.map(t => `${t._id}: ${t.count}`).join(', ') || 'no items';
  return { soonList, counts };
}

export async function chatWithAssistant(userId, messages = []) {
  const userText = String(getLastUserText(messages) || '').trim();
  const lower = userText.toLowerCase();

  // DB intent (keep this exact behavior)
  if (lower.includes('expiring') || lower.includes('next week')) {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const items = await Item.find({
      userId,
      expiryDate: { $gte: now, $lte: weekAhead },
      status: 'active'
    }).sort({ expiryDate: 1 });

    if (!items.length) return 'No items are expiring in the next 7 days.';
    const lines = items.map(i => `${i.name} (${i.category}) – ${new Date(i.expiryDate).toLocaleDateString()}`);
    return `Items expiring within a week:\n- ${lines.join('\n- ')}`;
  }

  // Everything else → Gemini with context
  const genAI = getGenAI();
  if (!genAI) {
    return 'AI is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY) in backend/.env and restart.';
  }

  try {
    const { soonList, counts } = await buildInventoryContext(userId);
    const system =
      `You are Smart Shelf AI. Be concise and practical. Use the inventory context when relevant. ` +
      `Do not invent items.\n\nInventory summary:\n- Category counts: ${counts}\n- Expiring soon (≤7 days):\n${soonList || 'none'}\n`;
    const prompt = `${system}\nUser: ${userText}\nAssistant:`;

    console.log('[AI] Calling Gemini…');
    const result = await generateWithFallback(genAI, prompt);
    const text = (result?.response?.text && result.response.text())
              || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || 'I could not generate a response.';
  } catch (e) {
    console.error('[AI] Gemini error (final):', e?.message || e);
    return 'I had trouble generating a response. Please try again.';
  }
}
