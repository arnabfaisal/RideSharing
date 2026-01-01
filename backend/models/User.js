const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vehicleSchema = new mongoose.Schema({
  make: String,
  model: String,
  plateNumber: String,
  color: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  roles: {
    driver: { type: Boolean, default: false },
    passenger: { type: Boolean, default: true },
    admin: { type: Boolean, default: false } 
  },
  vehicle: { type: vehicleSchema, default: null },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date, default: null },
  isBanned: { type: Boolean, default: false },
  
  appealCount: {
  type: Number,
  default: 0
},

appealStatus: {
  type: String,
  enum: ['none', 'pending', 'approved', 'rejected'],
  default: 'none'
},

appealMessage: {
  type: String,
  default: null
},

  

}, { toJSON: { virtuals: true } });

// Password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
