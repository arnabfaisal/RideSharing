const RewardAccount = require("../models/RewardAccount");
const RewardCatalog = require("../models/RewardCatalog");
const crypto = require("crypto");

const LEVELS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 500 },
  { name: "Gold", min: 1500 },
  { name: "Platinum", min: 3000 }
];

// Calculate the level based on points
function calculateLevel(points) {
  let level = "Bronze";
  for (const l of LEVELS) {
    if (points >= l.min) level = l.name;
  }
  return level;
}

// Generate a random referral code
function generateReferralCode() {
  return crypto.randomBytes(4).toString("hex");
}

// Create or find an existing reward account
async function createRewardAccount(userId) {
  try {
    let account = await RewardAccount.findOne({ userId });
    if (account) return account;

    account = await RewardAccount.create({
      userId,
      referralCode: generateReferralCode()
    });
    return account;
  } catch (error) {
    console.error('Error creating reward account:', error);
    throw new Error('Error creating reward account');
  }
}

/* ---------- POINT AWARDING ---------- */

// Add points to the account and update level
async function addPoints(userId, points, action) {
  try {
    const account = await RewardAccount.findOneAndUpdate(
      { userId },
      {
        $inc: { points },  // Increment points
        $set: { level: calculateLevel(points) },  // Update level
        $push: { history: { action, points } }  // Log the history
      },
      { new: true } // Return the updated document
    );
    return account;
  } catch (error) {
    console.error('Error adding points:', error);
    throw new Error('Error adding points');
  }
}

// Award points for a high rating
async function rewardHighRating(userId, rating) {
  try {
    if (rating >= 4.5) {
      return await addPoints(userId, 20, "High Rating Bonus");
    }
  } catch (error) {
    console.error('Error rewarding high rating:', error);
    throw new Error('Error rewarding high rating');
  }
}

/* ---------- REFERRALS ---------- */

// Process a referral and award points to the referrer
async function processReferral(referralCode, newUserId) {
  try {
    const referrer = await RewardAccount.findOne({ referralCode });
    if (!referrer || referrer.referredUsers.includes(newUserId)) return null;

    referrer.referredUsers.push(newUserId);
    referrer.points += 100;
    referrer.level = calculateLevel(referrer.points);
    referrer.history.push({
      action: "Successful Referral",
      points: 100
    });

    await referrer.save();
    return referrer;
  } catch (error) {
    console.error('Error processing referral:', error);
    throw new Error('Error processing referral');
  }
}

/* ---------- DASHBOARD ---------- */

// Get the user’s dashboard data
async function getDashboard(userId) {
  try {
    const account = await RewardAccount.findOne({ userId });
    if (!account) return null;

    const rewards = await RewardCatalog.find({ active: true });
    return { account, rewards };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Error fetching dashboard data');
  }
}

/* ---------- REDEMPTION ---------- */

// Redeem a reward for the user
async function redeemReward(userId, rewardId) {
  try {
    const account = await RewardAccount.findOne({ userId });
    const reward = await RewardCatalog.findById(rewardId);

    if (!account || !reward) return null;
    if (account.points < reward.pointsRequired) {
      return "INSUFFICIENT_POINTS";
    }

    // Deduct points for redemption
    account.points -= reward.pointsRequired;
    account.level = calculateLevel(account.points);
    account.history.push({
      action: `Redeemed: ${reward.title}`,
      points: -reward.pointsRequired
    });

    await account.save();
    return reward;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    throw new Error('Error redeeming reward');
  }
}

module.exports = {
  createRewardAccount,
  addPoints,
  rewardHighRating,
  processReferral,
  getDashboard,
  redeemReward
};
