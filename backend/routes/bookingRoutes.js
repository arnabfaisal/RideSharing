// backend/views/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');

// Public (or protect with auth middleware later)
router.get('/places/autocomplete', bookingCtrl.placesAutocomplete);
router.post('/fare/estimate', bookingCtrl.estimateFare);
router.post('/bookings', bookingCtrl.createBooking);
router.get('/bookings/:id', bookingCtrl.getBooking);

module.exports = router;
