const mongoose = require("mongoose");

const rewardCatalogSchema = new mongoose.Schema({
  title: String,
  description: String,
  pointsRequired: Number,
  type: {
    type: String,
    enum: ["DISCOUNT", "PRIORITY", "VOUCHER"]
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("RewardCatalog", rewardCatalogSchema);

