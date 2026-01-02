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
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],  // Enum for predefined levels
    default: "Bronze"
  },
  referralCode: {
    type: String,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9]{6,10}$/.test(v);  // Regex for alphanumeric referral codes of 6-10 chars
      },
      message: props => `${props.value} is not a valid referral code!`
    }
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

// Add indexes for frequent querying
rewardAccountSchema.index({ userId: 1 });
rewardAccountSchema.index({ referralCode: 1 });

module.exports = mongoose.model("RewardAccount", rewardAccountSchema);

