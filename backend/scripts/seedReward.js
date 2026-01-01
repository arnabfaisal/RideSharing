const mongoose = require('mongoose');
const RewardCatalog = require('../models/RewardCatalog');
require('dotenv').config();

const rewards = [
  {
    title: '10% Ride Discount',
    description: 'Get 10% off your next ride',
    pointsRequired: 200,
    type: 'DISCOUNT',
    active: true
  },
  {
    title: 'Priority Matching',
    description: 'Get matched with drivers faster for your next 5 rides',
    pointsRequired: 300,
    type: 'PRIORITY',
    active: true
  },
  {
    title: 'University Bookstore Voucher',
    description: '$5 voucher for the university bookstore',
    pointsRequired: 500,
    type: 'VOUCHER',
    active: true
  },
  {
    title: '25% Ride Discount',
    description: 'Get 25% off your next ride',
    pointsRequired: 750,
    type: 'DISCOUNT',
    active: true
  },
  {
    title: 'Free Ride',
    description: 'One completely free ride (up to 500 TAKA)',
    pointsRequired: 1000,
    type: 'DISCOUNT',
    active: true
  },
  {
    title: 'VIP Status - 1 Month',
    description: 'Priority matching and exclusive perks for 1 month',
    pointsRequired: 1500,
    type: 'PRIORITY',
    active: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await RewardCatalog.deleteMany({});
    console.log('Cleared existing rewards');
    
    await RewardCatalog.insertMany(rewards);
    console.log('✅ Rewards catalog seeded successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();