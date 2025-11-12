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
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // ✅ Notification Preferences (added safely, with defaults)
    notificationPrefs: {
      emailEnabled: { type: Boolean, default: true },
      expiringSoon: { type: Boolean, default: true },
      expired: { type: Boolean, default: true },
      digestDaily: { type: Boolean, default: false },
      digestWeekly: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

// ✅ Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password on login
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ✅ Correct export (this is what was missing)
export default mongoose.model('User', userSchema);

