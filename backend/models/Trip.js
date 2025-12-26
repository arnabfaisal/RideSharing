const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  tripType: {
    type: String,
    enum: ['RIDE', 'ITEM'],
    required: true
  },

  fareAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['IN_PROGRESS', 'PENDING_CONFIRMATION', 'COMPLETED'],
    default: 'IN_PROGRESS'
  },

  driverConfirmed: {
    type: Boolean,
    default: false
  },

  passengerConfirmed: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
