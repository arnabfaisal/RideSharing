const mongoose = require('mongoose');

const carpoolSchema = new mongoose.Schema({
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  pickupCentroid: { lat: Number, lon: Number },
  destinationCentroid: { lat: Number, lon: Number },
  totalFare: { type: Number, default: 0 },
  splitFares: { type: Map, of: Number, default: {} },
  status: { type: String, enum: ['open','driver_accepted','in_progress','completed','cancelled'], default: 'open' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CarpoolGroup', carpoolSchema);
