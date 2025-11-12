// // import mongoose from 'mongoose'

// // const itemSchema = new mongoose.Schema(
// //   {
// //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// //     name: { type: String, required: true },
// //     category: { type: String, enum: ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'], default: 'grocery' },
// //     dosage: { type: String }, // optional for medicines
// //     expiryDate: { type: Date, required: true },
// //     reminderTime: { type: Date },
// //     barcode: { type: String },
// //     status: { type: String, enum: ['active', 'expired', 'consumed'], default: 'active' },
// //     estimatedCost: { type: Number }, // for gamification
// //     consumedAt: { type: Date }
// //   },
// //   { timestamps: true }
// // )

// // itemSchema.pre('save', function (next) {
// //   if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
// //     this.status = 'expired'
// //   } else if (this.status !== 'consumed') {
// //     this.status = 'active'
// //   }
// //   next()
// // })

// // export default mongoose.model('Item', itemSchema)
// import mongoose from 'mongoose';

// const itemSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     name: { type: String, required: true, trim: true },
//     category: {
//       type: String,
//       enum: ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'],
//       default: 'grocery'
//     },
//     dosage: { type: String },              // optional for medicines
//     expiryDate: { type: Date, required: true },
//     reminderTime: { type: Date },
//     barcode: { type: String },
//     status: {
//       type: String,
//       enum: ['active', 'expired', 'consumed'],
//       default: 'active'
//     },
//     estimatedCost: { type: Number },       // for gamification
//     consumedAt: { type: Date }
//   },
//   { timestamps: true }
// );

// // helpful for queries and sorting
// itemSchema.index({ userId: 1, expiryDate: 1 });

// // keep status consistent on create
// itemSchema.pre('save', function (next) {
//   if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
//     this.status = this.status === 'consumed' ? 'consumed' : 'expired';
//   } else if (this.status !== 'consumed') {
//     this.status = 'active';
//   }
//   next();
// });

// // keep status consistent on update (findOneAndUpdate bypasses 'save')
// itemSchema.pre('findOneAndUpdate', function (next) {
//   const update = this.getUpdate() || {};
//   const expiry = update.expiryDate ?? update.$set?.expiryDate;

//   // Only recompute if expiryDate/status change and item not explicitly 'consumed'
//   if (expiry) {
//     const expDate = new Date(expiry);
//     if (!isNaN(expDate)) {
//       if (expDate < new Date()) {
//         this.setUpdate({
//           ...update,
//           $set: { ...(update.$set || {}), status: update.status === 'consumed' ? 'consumed' : 'expired' }
//         });
//       } else {
//         this.setUpdate({
//           ...update,
//           $set: { ...(update.$set || {}), status: update.status === 'consumed' ? 'consumed' : 'active' }
//         });
//       }
//     }
//   }
//   next();
// });

// export default mongoose.model('Item', itemSchema);
// import mongoose from 'mongoose';

// const itemSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     name: { type: String, required: true, trim: true },
//     category: {
//       type: String,
//       enum: ['grocery', 'medicine', 'cosmetic', 'beverage', 'other'],
//       default: 'grocery'
//     },
//     dosage: { type: String },              // optional for medicines
//     expiryDate: { type: Date, required: true },
//     reminderTime: { type: Date },
//     barcode: { type: String },
//     status: {
//       type: String,
//       enum: ['active', 'expired', 'consumed'],
//       default: 'active'
//     },
//     estimatedCost: { type: Number },       // for gamification
//     consumedAt: { type: Date }
//   },
//   { timestamps: true }
// );

// // helpful for queries and sorting
// itemSchema.index({ userId: 1, expiryDate: 1 });

// // keep status consistent on create
// itemSchema.pre('save', function (next) {
//   if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
//     this.status = this.status === 'consumed' ? 'consumed' : 'expired';
//   } else if (this.status !== 'consumed') {
//     this.status = 'active';
//   }
//   next();
// });

// // keep status consistent on update (findOneAndUpdate bypasses 'save')
// itemSchema.pre('findOneAndUpdate', function (next) {
//   const update = this.getUpdate() || {};
//   const set = update.$set || update;

//   if (set.expiryDate || set.status) {
//     const exp = set.expiryDate ? new Date(set.expiryDate) : null;
//     const isExpired = exp && !isNaN(exp) && exp < new Date();

//     // If explicitly setting 'consumed', keep it; otherwise compute active/expired
//     const nextStatus =
//       set.status === 'consumed'
//         ? 'consumed'
//         : isExpired
//           ? 'expired'
//           : 'active';

//     this.setUpdate({
//       ...update,
//       $set: { ...(update.$set || {}), status: nextStatus }
//     });
//   }
//   next();
// });

// export default mongoose.model('Item', itemSchema);










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

    // NEW optional details
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

    dosage: { type: String }, // optional for medicines

    expiryDate: { type: Date, required: true },
    purchaseDate: { type: Date },
    openedAt: { type: Date },

    reminderTime: { type: Date },

    status: {
      type: String,
      enum: ['active', 'expired', 'consumed'],
      default: 'active'
    },

    estimatedCost: { type: Number, min: 0 },
    consumedAt: { type: Date }
  },
  { timestamps: true }
);

// helpful for queries and sorting
itemSchema.index({ userId: 1, expiryDate: 1 });
itemSchema.index({ userId: 1, category: 1 });

// keep status consistent on create
itemSchema.pre('save', function (next) {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.status = this.status === 'consumed' ? 'consumed' : 'expired';
  } else if (this.status !== 'consumed') {
    this.status = 'active';
  }
  next();
});

// keep status consistent on update (findOneAndUpdate bypasses 'save')
itemSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const set = update.$set || update;

  if (set.expiryDate || set.status) {
    const exp = set.expiryDate ? new Date(set.expiryDate) : null;
    const isExpired = exp && !isNaN(exp) && exp < new Date();

    const nextStatus =
      set.status === 'consumed'
        ? 'consumed'
        : isExpired
          ? 'expired'
          : 'active';

    this.setUpdate({
      ...update,
      $set: { ...(update.$set || {}), status: nextStatus }
    });
  }
  next();
});

export default mongoose.model('Item', itemSchema);
