const mongoose = require('mongoose');

const locSchema = new mongoose.Schema({
  display_name: String,
  lat: Number,
  lon: Number
}, { _id: false });



const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // attach once auth integrated
  serviceType: { type: String, enum: ['ride', 'item'], required: true },
  pickup: { type: locSchema, required: true },
  destination: { type: locSchema, required: function() { return this.serviceType === 'ride'; } }, // item send might have only pickup or both; keep required for simplicity
  carpool: { type: Boolean, default: false },
  carpoolGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'CarpoolGroup', default: null },
  passengerFare: { type: Number, default: null },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  // Item specific
  itemDescription: { type: String, default: '' },
  itemSize: { type: String, enum: ['small','medium','large'], default: 'small' },
  // fare
  estimatedFare: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['requested','accepted','on_trip','completed','cancelled'], default: 'requested' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);