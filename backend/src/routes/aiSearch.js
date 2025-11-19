// routes/aiSearch.js
import express from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item.js';

const router = express.Router();

const INTENT_WORDS = new Set([
  'when','does','do','did','my','the','a','an','is','are','expire',
  'expires','expiry','expiration','will','stored','in','where','located',
  'how','long','left','have','has','near','nearby','which','what','items'
]);

function normalize(str = '') {
  return String(str).toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeRegex(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractCandidates(query = '') {
  const raw = normalize(query);
  const barcodes = raw.match(/\b\d{6,}\b/g) || [];
  const tokens = raw.split(' ').filter((t) => t && !INTENT_WORDS.has(t));
  const phrase = tokens.join(' ').trim();

  const words = phrase ? phrase.split(' ') : [];
  const ngrams = [];
  for (let len = words.length; len >= 1; len--) {
    for (let i = 0; i + len <= words.length; i++) {
      ngrams.push(words.slice(i, i + len).join(' '));
    }
  }
  return { raw, phrase, ngrams, barcodes };
}

function detectExpiryIntent(rawQuery = '') {
  if (!rawQuery) return null;
  const q = rawQuery.toLowerCase();
  const m = q.match(/(?:expire|expiring|expir(?:e|y)|expires)(?:.*?in|.*?within)?\s*(\d{1,2})\s*(day|days|week|weeks|month|months)?/i);
  if (m) {
    let n = Number(m[1] || 0);
    const unit = (m[2] || 'days').toLowerCase();
    if (unit.startsWith('week')) n = Math.max(1, n * 7);
    if (unit.startsWith('month')) n = Math.max(28, n * 30);
    return { type: 'expiry', days: n };
  }
  if (q.includes('expiring soon') || q.includes('what expires soon') || q.includes('expiring in')) return { type: 'expiry', days: 7 };
  if (q.match(/\b(expire|expiring|expires).*\btomorrow\b/)) return { type: 'expiry', days: 1 };
  if (q.match(/\b(expire|expiring|expires).*\btoday\b/)) return { type: 'expiry', days: 0 };
  return null;
}

async function findItemsExpiringWithin(userId, days) {
  let uid = userId;
  try { uid = mongoose.Types.ObjectId(userId); } catch (e) { /* use raw */ }
  const now = new Date();
  const end = new Date(now); end.setDate(end.getDate() + Math.max(0, Number(days || 0)));
  return Item.find({ userId: uid, expiryDate: { $gte: now, $lte: end } }).sort({ expiryDate: 1 }).limit(50).lean().exec();
}

async function tryFind(userId, candidates) {
  if (!userId) return null;
  let uid;
  try { uid = mongoose.Types.ObjectId(userId); } catch (e) { uid = userId; }

  for (const bc of candidates.barcodes || []) {
    if (!bc) continue;
    const it = await Item.findOne({ userId: uid, barcode: bc }).lean();
    if (it) return it;
  }

  for (const n of candidates.ngrams || []) {
    if (!n) continue;
    const it = await Item.findOne({ userId: uid, name: { $regex: `^${escapeRegex(n)}$`, $options: 'i' } }).lean();
    if (it) return it;
  }

  for (const n of candidates.ngrams || []) {
    if (!n) continue;
    const it = await Item.findOne({ userId: uid, brand: { $regex: `^${escapeRegex(n)}$`, $options: 'i' } }).lean();
    if (it) return it;
  }

  for (const n of candidates.ngrams || []) {
    if (!n) continue;
    const it = await Item.findOne({
      userId: uid,
      $or: [
        { name: { $regex: escapeRegex(n), $options: 'i' } },
        { brand: { $regex: escapeRegex(n), $options: 'i' } }
      ]
    }).lean();
    if (it) return it;
  }

  try {
    const phrase = candidates.phrase || (candidates.ngrams && candidates.ngrams[0]) || '';
    if (phrase && phrase.length >= 2) {
      const it = await Item.findOne({
        userId: uid,
        $or: [
          { name: { $regex: escapeRegex(phrase), $options: 'i' } },
          { brand: { $regex: escapeRegex(phrase), $options: 'i' } }
        ]
      }).lean();
      if (it) return it;
    }
  } catch (e) {
    console.warn('[ai-search] fallback substring search failed:', e?.message || e);
  }

  return null;
}

async function multiFind(userId, candidates, limit = 20) {
  if (!userId) return [];
  let uid;
  try { uid = mongoose.Types.ObjectId(userId); } catch (e) { uid = userId; }

  const phrase = candidates.phrase || (candidates.ngrams && candidates.ngrams[0]) || '';
  const orClauses = [];

  for (const bc of candidates.barcodes || []) {
    if (!bc) continue;
    orClauses.push({ barcode: bc });
  }

  if (phrase && phrase.length >= 1) {
    orClauses.push({ name: { $regex: escapeRegex(phrase), $options: 'i' } });
    orClauses.push({ brand: { $regex: escapeRegex(phrase), $options: 'i' } });
  }

  if (!orClauses.length) {
    return Item.find({ userId: uid }).sort({ expiryDate: 1 }).limit(limit).lean().exec();
  }

  return Item.find({ userId: uid, $or: orClauses }).sort({ expiryDate: 1 }).limit(limit).lean().exec();
}

/** POST /api/items/ai-search */
router.post('/ai-search', async (req, res) => {
  try {
    const { userId, query } = req.body || {};
    if (!userId || !query) return res.status(200).json({ found: false, reason: 'missing userId or query' });

    const raw = normalize(query);
    const expiryIntent = detectExpiryIntent(raw);

    if (expiryIntent && expiryIntent.type === 'expiry') {
      const days = expiryIntent.days ?? 7;
      const items = await findItemsExpiringWithin(userId, days);
      if (!items || items.length === 0) {
        return res.json({ found: false, items: [], evidence: { source: 'SmartShelf DB', queryType: 'expiry', days } });
      }
      const mapped = items.map((item) => ({
        id: item._id, name: item.name, brand: item.brand, expiryDate: item.expiryDate,
        quantity: item.quantity, unit: item.unit, location: item.location, status: item.status,
        barcode: item.barcode, notified: item.notified
      }));
      return res.json({ found: true, items: mapped, evidence: { source: 'SmartShelf DB', queryType: 'expiry', days } });
    }

    const candidates = extractCandidates(query);
    const item = await tryFind(userId, candidates);

    if (item) {
      return res.json({
        found: true,
        item: {
          id: item._id, name: item.name, brand: item.brand, expiryDate: item.expiryDate,
          quantity: item.quantity, unit: item.unit, location: item.location, status: item.status,
          barcode: item.barcode, notified: item.notified
        },
        evidence: { source: 'SmartShelf DB', queryType: 'single' }
      });
    }

    const matches = await multiFind(userId, candidates, 20);
    if (matches && matches.length) {
      const mapped = matches.map((item) => ({
        id: item._id, name: item.name, brand: item.brand, expiryDate: item.expiryDate,
        quantity: item.quantity, unit: item.unit, location: item.location, status: item.status,
        barcode: item.barcode, notified: item.notified
      }));
      return res.json({ found: true, items: mapped, evidence: { source: 'SmartShelf DB', queryType: 'multi' } });
    }

    return res.json({ found: false, evidence: { source: 'SmartShelf DB', queryType: 'single_or_multi' } });
  } catch (err) {
    console.error('[ai-search] error:', err);
    return res.status(500).json({ found: false, error: err?.message || 'internal error' });
  }
});

export default router;
