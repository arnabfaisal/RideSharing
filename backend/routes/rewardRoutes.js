const express = require("express");
const router = express.Router();
const rewardService = require("../services/rewardService");

router.get("/dashboard/:userId", async (req, res) => {
  const data = await rewardService.getDashboard(req.params.userId);
  res.json(data);
});

router.post("/redeem", async (req, res) => {
  const { userId, rewardId } = req.body;
  const result = await rewardService.redeemReward(userId, rewardId);
  res.json({ result });
});

module.exports = router;

