import express from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item.js';

const router = express.Router();

const INTENT_WORDS = new Set([
  "when","does","do","did","my","the","a","an","is","are","expire",
  "expires","expiry","expiration","will","stored","in","where","located",
  "how","long","left","have","has","near","nearby"
]);

function normalize(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCandidates(query) {
  const raw = normalize(query);
  const barcodes = raw.match(/\b\d{6,}\b/g) || [];
  const tokens = raw.split(" ").filter(t => t && !INTENT_WORDS.has(t));
  const phrase = tokens.join(" ").trim();

  const words = phrase.split(" ");
  const ngrams = [];
  for (let len = words.length; len >= 1; len--) {
    for (let i = 0; i + len <= words.length; i++) {
      ngrams.push(words.slice(i, i + len).join(" "));
    }
  }

  return { raw, phrase, ngrams, barcodes };
}

async function tryFind(userId, candidates) {
  const uid = mongoose.Types.ObjectId(userId);

  // 1) barcode
  for (const bc of candidates.barcodes) {
    const it = await Item.findOne({ userId: uid, barcode: bc });
    if (it) return it;
  }

  // 2) exact name
  for (const n of candidates.ngrams) {
    const it = await Item.findOne({
      userId: uid,
      name: { $regex: `^${escapeRegex(n)}$`, $options: "i" }
    });
    if (it) return it;
  }

  // 3) exact brand
  for (const n of candidates.ngrams) {
    const it = await Item.findOne({
      userId: uid,
      brand: { $regex: `^${escapeRegex(n)}$`, $options: "i" }
    });
    if (it) return it;
  }

  // 4) partial
  for (const n of candidates.ngrams) {
    const it = await Item.findOne({
      userId: uid,
      $or: [
        { name: { $regex: escapeRegex(n), $options: "i" } },
        { brand: { $regex: escapeRegex(n), $options: "i" } }
      ]
    });
    if (it) return it;
  }

  return null;
}

router.post('/ai-search', async (req, res) => {
  const { userId, query } = req.body;
  const candidates = extractCandidates(query);

  const item = await tryFind(userId, candidates);

  if (!item) {
    return res.json({
      found: false,
      evidence: { source: "SmartShelf DB" }
    });
  }

  return res.json({
    found: true,
    item: {
      id: item._id,
      name: item.name,
      brand: item.brand,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      unit: item.unit,
      location: item.location,
      status: item.status,
      barcode: item.barcode,
      notified: item.notified
    },
    evidence: { source: "SmartShelf DB" }
  });
});

export default router;
