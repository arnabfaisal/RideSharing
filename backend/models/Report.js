// backend/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Late', 'Rude Behavior', 'No Show' , 'Other'],
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['OPEN', 'REVIEWED', 'RESOLVED'],
      default: 'OPEN'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
