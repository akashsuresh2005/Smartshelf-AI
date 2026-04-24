import Item from '../models/Item.js';

export async function handleReply(req, res) {
  const msg = req.body.Body?.toLowerCase();
  const from = req.body.From;

  if (msg === 'used') {
    await Item.updateMany(
      { phone: from },
      { $set: { status: 'used' } }
    );
  }

  if (msg === 'remind') {
    // optional logic
  }

  res.send("OK");
}