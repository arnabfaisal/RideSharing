// backend/views/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');
const carpoolCtrl = require('../controllers/carpoolController');
const { requireDriverRole } = require('../middleware/roleCheck');


// middleware so that only authenticated users can access booking routes 


const { protect } = require('../middleware/auth');
router.use(protect);

// Public (or protect with auth middleware later)
router.get('/places/autocomplete', bookingCtrl.placesAutocomplete);
router.post('/fare/estimate', bookingCtrl.estimateFare);
router.post('/bookings', bookingCtrl.createBooking);
router.get('/bookings/:id', bookingCtrl.getBooking);

// Carpool endpoints
router.post('/carpool/attempt/:id', carpoolCtrl.attemptGroupForBooking);
router.get('/carpool/:id', carpoolCtrl.getGroup);
router.post('/carpool/:id/accept', requireDriverRole, carpoolCtrl.acceptGroup);

// Driver match listing (prioritized)
router.get('/driver/match', requireDriverRole, carpoolCtrl.listDriverMatches);

module.exports = router;
