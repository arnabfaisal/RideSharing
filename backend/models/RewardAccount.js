const mongoose = require("mongoose");

const rewardAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    default: "Bronze"
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  history: [{
    action: String,
    points: Number,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("RewardAccount", rewardAccountSchema);
