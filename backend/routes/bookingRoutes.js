// backend/views/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');
const carpoolCtrl = require('../controllers/carpoolController');
const { requireDriverRole } = require('../middleware/roleCheck');


// middleware so that only authenticated users can access booking routes 

router.get('/places/autocomplete', bookingCtrl.placesAutocomplete);
router.post('/fare/estimate', bookingCtrl.estimateFare);



const { protect } = require('../middleware/auth');
router.use(protect);

// Public (or protect with auth middleware later)

const { requirePassengerRole } = require('../middleware/roleCheck');
router.post('/bookings', requirePassengerRole, bookingCtrl.createBooking);
router.get('/bookings/:id', bookingCtrl.getBooking);
router.post('/bookings/:id/confirm', protect, bookingCtrl.confirmBooking);
router.post('/bookings/:id/status', requireDriverRole, bookingCtrl.updateBookingStatus);

// Carpool endpoints
router.post('/carpool/attempt/:id', carpoolCtrl.attemptGroupForBooking);
router.get('/carpool/:id', carpoolCtrl.getGroup);
router.post('/carpool/:id/accept', requireDriverRole, carpoolCtrl.acceptGroup);
// driver accepting a single (solo) booking
router.post('/bookings/:id/accept', requireDriverRole, require('../controllers/bookingController').acceptBooking);
router.post('/carpool/:id/location', requireDriverRole, carpoolCtrl.updateLocation);
router.post('/carpool/:id/status', requireDriverRole, carpoolCtrl.updateStatus);
router.post('/carpool/:id/rate', protect, carpoolCtrl.rateDriver);

// Driver match listing (prioritized)
router.get('/driver/match', requireDriverRole, carpoolCtrl.listDriverMatches);

// Unified activity history for authenticated user
router.get('/me/activity', protect, async (req, res) => {
	try {
		const Booking = require('../models/Bookings');
		const Trip = require('../models/Trip');
		const bookings = await Booking.find({ $or: [ { user: req.user._id }, { 'user': req.user._id } ] }).sort({ createdAt: -1 }).lean();
		const trips = await Trip.find({ $or: [ { driver: req.user._id }, { passenger: req.user._id } ] }).sort({ createdAt: -1 }).lean();
		res.json({ success: true, data: { bookings, trips } });
	} catch (err) {
		console.error('me/activity error', err);
		res.status(500).json({ success: false, message: 'Failed', error: err.message });
	}
});

module.exports = router;
