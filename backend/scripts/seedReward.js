const mongoose = require('mongoose');
const RewardCatalog = require('../models/RewardCatalog');
require('dotenv').config();

// Rewards to be inserted
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

// Seed function to insert data
async function seed() {
  try {
    // Check if MONGO_URI is set in environment variables
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in the environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear the current rewards in the catalog
    await RewardCatalog.deleteMany({});
    console.log('Cleared existing rewards from the catalog');

    // Insert new rewards
    const result = await RewardCatalog.insertMany(rewards);
    console.log(`✅ Successfully inserted ${result.length} rewards into the catalog`);

    // Gracefully disconnect from MongoDB before exiting
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);  // Exit with success
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    process.exit(1);  // Exit with failure
  }
}

// Call the seed function
seed();
