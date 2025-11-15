// import mongoose from 'mongoose'
// import bcrypt from 'bcryptjs'

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true }
//   },
//   { timestamps: true }
// )

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next()
//   const salt = await bcrypt.genSalt(10)
//   this.password = await bcrypt.hash(this.password, salt)
//   next()
// })

// userSchema.methods.comparePassword = async function (candidate) {
//   return bcrypt.compare(candidate, this.password)
// }

// export default mongoose.model('User', userSchema)
// ...existing imports and schema...
// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // Appearance preferences
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    accent: { type: String, default: '#0b5fff' },
    layoutDensity: { type: String, enum: ['spacious', 'compact'], default: 'spacious' },

    // Notification Preferences (explicit shape to match frontend)
    notificationPrefs: {
      emailEnabled: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: true },
      reminderDays: { type: Number, default: 3 },
      digest: { type: String, enum: ['off', 'daily', 'weekly'], default: 'weekly' }
    },

    // Misc
    avatarUrl: { type: String },
    sessionsRevokedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password on login
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
