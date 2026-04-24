import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    name: { type: String, required: true, trim: true },

    category: {
      type: String,
      enum: ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'],
      default: 'grocery'
    },

    barcode: { type: String, index: true },
    brand: { type: String, trim: true },
    quantity: { type: Number, min: 0 },
    unit: {
      type: String,
      enum: ['pcs', 'g', 'kg', 'ml', 'l', 'tablet', 'capsule', 'pack', 'other'],
      default: 'pcs'
    },
    location: {
      type: String,
      enum: ['pantry', 'fridge', 'freezer', 'medicine-cabinet', 'other'],
      default: 'pantry'
    },
    notes: { type: String, maxlength: 500 },

    // ✅ WhatsApp number for expiry alerts
    whatsappNumber: { type: String },

    expiryDate: { type: Date, required: true },
    purchaseDate: { type: Date },
    openedAt: { type: Date },

    reminderTime: { type: Date },

    status: {
      type: String,
      enum: ['active', 'expired', 'consumed'],
      default: 'active'
    },

    notified: { type: Boolean, default: false },
    notifiedAt: { type: Date, default: null },

    estimatedCost: { type: Number, min: 0 },
    consumedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);