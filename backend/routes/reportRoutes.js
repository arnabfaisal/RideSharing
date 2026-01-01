// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');


/**
 * Passenger reports driver (ONLY after completed trip)
 */
router.post('/', protect, async (req, res) => {
  try {
    const { tripId, category, description } = req.body;

    if (!tripId || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Trip must be completed
    if (trip.status !== 'COMPLETED') {
      return res.status(400).json({
        message: 'Trip must be completed before reporting'
      });
    }

    // ONLY passenger can report
    if (trip.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only passenger can report the driver'
      });
    }

    // Prevent duplicate reports for same trip
    const existing = await Report.findOne({ trip: trip._id });
    if (existing) {
      return res.status(400).json({
        message: 'This trip has already been reported'
      });
    }

const report = await Report.create({
  trip: trip._id,
  reporter: trip.passenger,
  reportedUser: trip.driver,
  category,
  description
});

/* ===============================
   AUTO-BAN AFTER 5 REPORTS
================================ */

const reportCount = await Report.countDocuments({
  reportedUser: trip.driver
});

if (reportCount >= 2) {
  await User.findByIdAndUpdate(trip.driver, {
    isBanned: true
  });
}

res.status(201).json({
  success: true,
  message:
    reportCount >= 2
      ? 'Driver reported and automatically banned'
      : 'Driver reported successfully',
  report
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
/**
 * Admin: View all reports
 */
router.get('/', protect, requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate(
        'reportedUser',
        'name email isSuspended isBanned suspendedUntil'
      )
      .populate('trip');

    res.json({
      success: true,
      total: reports.length,
      reports
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * Passenger: view own reports
 */
router.get('/my', protect, async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('trip', '_id')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
