const express = require("express");
const router = express.Router();
const rewardService = require("../services/rewardService");
const { protect } = require("../middleware/auth");

// Route to get the user reward dashboard
router.get("/dashboard", protect, async (req, res) => {
  try {
    const data = await rewardService.getDashboard(req.user._id);
    
    if (!data) {
      return res.status(404).json({ message: "Dashboard data not found" });
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to redeem a reward
router.post("/redeem", protect, async (req, res) => {
  const { rewardId } = req.body;
  
  // Validate rewardId is provided
  if (!rewardId) {
    return res.status(400).json({ success: false, message: "Reward ID is required" });
  }

  try {
    const result = await rewardService.redeemReward(req.user._id, rewardId);
    
    if (!result) {
      return res.status(400).json({ success: false, message: "Insufficient points or invalid reward" });
    }

    res.status(200).json({ success: true, message: "Reward redeemed successfully", result });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;


