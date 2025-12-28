const Rating = require('../models/Rating');
const Trip = require('../models/Trip');

/**
 * Passenger creates rating (after trip completed)
 */
exports.createRating = async (req, res) => {
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

    const rating = await Rating.create({
      trip: trip._id,
      passenger: trip.passenger,
      driver: trip.driver,
      stars,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted',
      rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



/**
 * Driver views ratings + analytics
 */
exports.getDriverRatings = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    if (req.user._id.toString() !== driverId.toString()) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    const ratings = await Rating.find({ driver: driverId });

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    ratings.forEach(r => {
      breakdown[r.stars]++;
      total += r.stars;
    });

    const average =
      ratings.length > 0 ? (total / ratings.length).toFixed(2) : 0;

    res.json({
      success: true,
      average,
      breakdown,
      ratings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Driver responds to rating
 */
exports.respondToRating = async (req, res) => {
  try {
    const { response } = req.body;
    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    if (rating.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only driver can respond'
      });
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
};
