const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Points', pointsSchema);
