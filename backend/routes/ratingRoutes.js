const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Trip = require('../models/Trip');
const User = require('../models/User');

const { protect } = require('../middleware/auth');


/**
 * Passenger creates rating after trip completion
 * POST /api/ratings/:tripId
 */
router.post('/:tripId', protect, async (req, res) => {
  try {
    const { stars, comment } = req.body;

    if (!stars) {
      return res.status(400).json({ message: 'Stars are required' });
    }

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'COMPLETED') {
      return res.status(400).json({
        message: 'Trip must be completed before rating'
      });
    }

    if (trip.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only passenger can rate this trip'
      });
    }

    const existing = await Rating.findOne({ trip: trip._id });
    if (existing) {
      return res.status(400).json({
        message: 'Trip already rated'
      });
    }
    // Ensure the rated user is actually a driver
    const driverUser = await User.findById(trip.driver);

    if (!driverUser || !driverUser.roles.driver) {
      return res.status(400).json({
        message: 'Ratings can only be given to drivers'
      });
    }
    const rating = await Rating.create({
      trip: trip._id,
      passenger: trip.passenger,
      driver: trip.driver,
      stars,
      comment
    });
    driverUser.ratingCount += 1;

    driverUser.rating =
    ((driverUser.rating * (driverUser.ratingCount - 1)) + stars)
    / driverUser.ratingCount;

await driverUser.save();
    res.status(201).json({
      success: true,
      message: 'Rating submitted',
      rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
/**
 * Driver rating analytics (average + breakdown)
 * GET /api/ratings/driver/:driverId/summary
 */

router.get('/driver/:driverId/summary', async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const driver = await User.findById(driverId);
    if (!driver || !driver.roles.driver) {
    return res.status(400).json({
      message: 'User is not a driver'
  });
}

    const ratings = await Rating.find({ driver: driverId });

    if (ratings.length === 0) {
      return res.json({
        success: true,
        average: 0,
        total: 0,
        breakdown: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      });
    }

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    ratings.forEach(r => {
      breakdown[r.stars]++;
      sum += r.stars;
    });

    const average = (sum / ratings.length).toFixed(2);

    res.json({
      success: true,
      average: Number(average),
      total: ratings.length,
      breakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
/**
 * Driver views ratings written about them
 */
router.get('/driver/my', protect, async (req, res) => {
  try {
    if (!req.user.roles.driver) {
      return res.status(403).json({ message: 'Only drivers can view ratings' });
    }

    const ratings = await Rating.find({ driver: req.user._id })
      .populate('passenger', 'name email')
      .populate('trip', '_id')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      ratings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
/**
 * Driver responds to a rating
 */
router.post('/:ratingId/respond', protect, async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: 'Response text required' });
    }

    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Only the driver can respond
    if (rating.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (rating.driverResponse) {
      return res.status(400).json({ message: 'Already responded to this rating' });
    }

    rating.driverResponse = response;
    await rating.save();

    res.json({
      success: true,
      message: 'Response added',
      rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
/**
 * Passenger views their own ratings
 * GET /api/ratings/passenger/my
 */
router.get('/passenger/my', protect, async (req, res) => {
  try {
    if (!req.user.roles.passenger) {
      return res.status(403).json({
        message: 'Only passengers can view their ratings'
      });
    }

    const ratings = await Rating.find({ passenger: req.user._id })
      .populate('trip', '_id')
      .populate('driver', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      ratings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
