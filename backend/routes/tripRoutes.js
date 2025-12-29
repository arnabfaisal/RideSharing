const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Booking = require('../models/Bookings');
const { protect } = require('../middleware/auth');

/**
 * -------------------------------------------------------
 * TEMP ROUTE: Create a trip (for testing R5 only)
 * Trip creation normally belongs to R1 / R2
 * -------------------------------------------------------
 */
router.post('/test', async (req, res) => {
  try {
    const { driver, passenger, tripType, fareAmount } = req.body;

    if (!driver || !passenger || !tripType || !fareAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const trip = await Trip.create({
      driver,
      passenger,
      tripType,
      fareAmount,
      status: 'IN_PROGRESS',
      driverConfirmed: false,
      passengerConfirmed: false
    });

    res.status(201).json({
      success: true,
      message: 'Trip created for testing',
      trip
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Trip creation failed',
      error: err.message
    });
  }
});

/**
 * -------------------------------------------------------
 * Passenger confirms trip completion
 * -------------------------------------------------------
 */
router.post('/:id/confirm/passenger', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Authorization check
    if (trip.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized as passenger' });
    }

    if (trip.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Trip already completed' });
    }

    trip.passengerConfirmed = true;
    trip.status = trip.driverConfirmed
      ? 'COMPLETED'
      : 'PENDING_CONFIRMATION';

    await trip.save();

    // notify booking room if linked so passenger UI updates
    try {
      const io = req.app.get('io');
      if (io && trip.booking) {
        // if both confirmed -> completed
        if (trip.status === 'COMPLETED') io.to(`booking_${trip.booking}`).emit('bookingCompleted', { bookingId: trip.booking, trip });
        else io.to(`booking_${trip.booking}`).emit('bookingOnTrip', { bookingId: trip.booking, trip });
      }
    } catch (e) { console.error('socket emit error', e); }

    // ensure booking record is updated when trip status changes
    try {
      if (trip.booking) {
        const bookingStatus = trip.status === 'COMPLETED' ? 'completed' : 'on_trip';
        await Booking.findByIdAndUpdate(trip.booking, { $set: { status: bookingStatus } });
      }
    } catch (e) { console.error('failed to sync booking status', e); }

    res.json({
      success: true,
      message: 'Passenger confirmed trip',
      trip
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * -------------------------------------------------------
 * Driver confirms trip completion
 * -------------------------------------------------------
 */
router.post('/:id/confirm/driver', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Authorization check
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized as driver' });
    }

    if (trip.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Trip already completed' });
    }

    trip.driverConfirmed = true;
    trip.status = trip.passengerConfirmed
      ? 'COMPLETED'
      : 'PENDING_CONFIRMATION';

    await trip.save();

    // notify booking room if linked so passenger UI updates
    try {
      const io = req.app.get('io');
      if (io && trip.booking) {
        if (trip.status === 'COMPLETED') io.to(`booking_${trip.booking}`).emit('bookingCompleted', { bookingId: trip.booking, trip });
        else io.to(`booking_${trip.booking}`).emit('bookingOnTrip', { bookingId: trip.booking, trip });
      }
    } catch (e) { console.error('socket emit error', e); }

    // ensure booking record is updated when trip status changes
    try {
      if (trip.booking) {
        const bookingStatus = trip.status === 'COMPLETED' ? 'completed' : 'on_trip';
        await Booking.findByIdAndUpdate(trip.booking, { $set: { status: bookingStatus } });
      }
    } catch (e) { console.error('failed to sync booking status', e); }
    res.json({
      success: true,
      message: 'Driver confirmed trip',
      trip
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
