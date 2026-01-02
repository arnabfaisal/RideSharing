const mongoose = require("mongoose");

const rewardCatalogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,  
    trim: true       
  },
  description: {
    type: String,
    required: true,  
    trim: true       
  },
  pointsRequired: {
    type: Number,
    required: true,  
    min: 0,          
    default: 0       
  },
  type: {
    type: String,
    enum: ["DISCOUNT", "PRIORITY", "VOUCHER"],  // Enum for allowed types
    required: true  // Ensure type is provided
  },
  active: {
    type: Boolean,
    default: true  
  }
});


rewardCatalogSchema.index({ title: 1 });
rewardCatalogSchema.index({ type: 1 });

module.exports = mongoose.model("RewardCatalog", rewardCatalogSchema);

