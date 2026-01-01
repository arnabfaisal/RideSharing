const RewardAccount = require("../models/RewardAccount");
const RewardCatalog = require("../models/RewardCatalog");
const crypto = require("crypto");

const LEVELS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 500 },
  { name: "Gold", min: 1500 },
  { name: "Platinum", min: 3000 }
];

function calculateLevel(points) {
  let level = "Bronze";
  for (const l of LEVELS) {
    if (points >= l.min) level = l.name;
  }
  return level;
}

function generateReferralCode() {
  return crypto.randomBytes(4).toString("hex");
}

async function createRewardAccount(userId) {
  return RewardAccount.create({
    userId,
    referralCode: generateReferralCode()
  });
}

/* ---------- POINT AWARDING ---------- */

async function addPoints(userId, points, action) {
  const account = await RewardAccount.findOne({ userId });
  if (!account) return null;

  account.points += points;
  account.level = calculateLevel(account.points);
  account.history.push({ action, points });

  await account.save();
  return account;
}

async function rewardHighRating(userId, rating) {
  if (rating >= 4.5) {
    return addPoints(userId, 20, "High Rating Bonus");
  }
}

/* ---------- REFERRALS ---------- */

async function processReferral(referralCode, newUserId) {
  const referrer = await RewardAccount.findOne({ referralCode });
  if (!referrer) return null;

  if (referrer.referredUsers.includes(newUserId)) return null;

  referrer.referredUsers.push(newUserId);
  referrer.points += 100;
  referrer.level = calculateLevel(referrer.points);
  referrer.history.push({
    action: "Successful Referral",
    points: 100
  });

  await referrer.save();
  return referrer;
}

/* ---------- DASHBOARD ---------- */

async function getDashboard(userId) {
  const account = await RewardAccount.findOne({ userId });
  const rewards = await RewardCatalog.find({ active: true });
  return { account, rewards };
}

/* ---------- REDEMPTION ---------- */

async function redeemReward(userId, rewardId) {
  const account = await RewardAccount.findOne({ userId });
  const reward = await RewardCatalog.findById(rewardId);

  if (!account || !reward) return null;
  if (account.points < reward.pointsRequired) {
    return "INSUFFICIENT_POINTS";
  }

  account.points -= reward.pointsRequired;
  account.level = calculateLevel(account.points);
  account.history.push({
    action: `Redeemed: ${reward.title}`,
    points: -reward.pointsRequired
  });

  await account.save();
  return reward;
}

module.exports = {
  createRewardAccount,
  addPoints,
  rewardHighRating,
  processReferral,
  getDashboard,
  redeemReward
};
