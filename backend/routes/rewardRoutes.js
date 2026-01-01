const express = require("express");
const router = express.Router();
const rewardService = require("../services/rewardService");
const { protect } = require("../middleware/auth");

// Use authenticated user ID from token to avoid callers sending `undefined` or invalid ids
router.get("/dashboard", protect, async (req, res) => {
  const data = await rewardService.getDashboard(req.user._id);
  res.json(data);
});

router.post("/redeem", protect, async (req, res) => {
  const { rewardId } = req.body;
  const result = await rewardService.redeemReward(req.user._id, rewardId);
  res.json({ result });
});

module.exports = router;

