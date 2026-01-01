const { autocomplete } = require('../utils/mapService');
const Booking = require('../models/Bookings');
const { haversineDistanceKm } = require('../utils/geo');
const carpoolService = require('../services/carpoolService');


// r4
const rewardService = require('../services/rewardService');
// r4


const RIDE_BASE = 100; // taka
const RIDE_PER_KM = 10;
const CARPOOL_DISCOUNT = .3;

const ITEM_BASE = 50;
const ITEM_PER_KM = 5;
const SIZE_MULT = {
    small: 1,
    medium: 1.5,
    large: 2
};



exports.placesAutocomplete = async (req, res) => {
    try {
        const {q} = req.query || "";
        const limit = parseInt(req.query.limit || '5', 10); 

        if(!q) {
            return res.json([]);
        }
        const places = await autocomplete(q,limit);
        res.json({success:true, data: places});
        
    } catch (err) {
        console.error("autocomplete error:", err);
        res.status(500).json({ success: false, message: 'Autocomplete failed', error: err.message });
        
    }
}



function estimateRideFare(km, carpool=false){
    let fare = RIDE_BASE + (RIDE_PER_KM *km);

    if(carpool){
        fare = fare *(1 - CARPOOL_DISCOUNT);
    }
    return Math.round(fare * 100) /100;
}


function estimateItemFare(km, size= "small"){
    let fare = ITEM_BASE + (ITEM_PER_KM * km * SIZE_MULT[size]);
    return Math.round(fare * 100) /100;
}

exports.estimateFare = (req, res) => {
    try {

        const body = req.body;

        const { serviceType, pickup, destination, carpool, itemSize } = body;

            if (!serviceType || !pickup || !destination) {
            return res.status(400).json({ success: false, message: 'serviceType, pickup and destination required' });
            }
            const km = haversineDistanceKm(parseFloat(pickup.lat), parseFloat(pickup.lon), parseFloat(destination.lat), parseFloat(destination.lon));
            let fare = 0;
            if (serviceType === 'ride') {
            fare = estimateRideFare(km, !!carpool);
            } else if (serviceType === 'item') {
            fare = estimateItemFare(km, itemSize || 'small');
            } else {
            return res.status(400).json({ success: false, message: 'Invalid serviceType' });
            }

            console.log('estimate fare:',
              {
                distanceKm: Math.round(km * 100) / 100,
                estimatedFare: fare,
                currency: 'TAKA',
                breakdown: {
                serviceType,
                base: serviceType === 'ride' ? RIDE_BASE : ITEM_BASE,
                perKm: serviceType === 'ride' ? RIDE_PER_KM : ITEM_PER_KM,
                carpool: !!carpool,
                itemSize: itemSize || null
                }
            })

            res.json({
            success: true,
            data: {
                distanceKm: Math.round(km * 100) / 100,
                estimatedFare: fare,
                currency: 'TAKA',
                breakdown: {
                serviceType,
                base: serviceType === 'ride' ? RIDE_BASE : ITEM_BASE,
                perKm: serviceType === 'ride' ? RIDE_PER_KM : ITEM_PER_KM,
                carpool: !!carpool,
                itemSize: itemSize || null
                }
            }

            });
    } catch (err) {
        console.error('estimate fare error', err);
        res.status(500).json({ success: false, message: 'Estimation failed', error: err.message });
    }
};

exports.createBooking = async (req, res) => {
  try {
    const body = req.body;
    const { serviceType, pickup, destination, carpool, itemDescription, itemSize } = body;
    if (!serviceType || !pickup || !destination) {
      return res.status(400).json({ success: false, message: 'serviceType, pickup and destination required' });
    }

    // compute estimated fare same as estimateFare
    const km = haversineDistanceKm(parseFloat(pickup.lat), parseFloat(pickup.lon), parseFloat(destination.lat), parseFloat(destination.lon));
    let estimatedFare = 0;
    if (serviceType === 'ride') estimatedFare = estimateRideFare(km, !!carpool);
    else estimatedFare = estimateItemFare(km, itemSize || 'small');

    console.log('Creating booking for user:', req.user);

    if(!req.user){
      return res.status(401).json({
        success: false,
        message: "Authentication required to create booking",

      })
    }

    const booking = await Booking.create({
      user: req.user._id,
      //user: req.user ? req.user._id : null, // will be set when you integrate auth protect middleware
      serviceType,
      pickup,
      destination,
      carpool: !!carpool,
      itemDescription: itemDescription || '',
      itemSize: itemSize || 'small',
      estimatedFare
    });

    // If carpool requested, attempt to form a group
    let group = null;
    try {
      if (booking.carpool) {
        group = await carpoolService.attemptGroup(booking);
      }
    } catch (e) {
      console.error('carpool attempt failed:', e);
    }

    res.status(201).json({ success: true, data: booking, carpoolGroup: group });
  } catch (err) {
    console.error('create booking error', err);
    res.status(500).json({ success: false, message: 'Booking failed', error: err.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('get booking error', err);
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};     

// driver accepts a solo booking (non-carpool)
exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.carpool) return res.status(400).json({ success: false, message: 'This is a carpool booking; use group accept' });
    if (booking.status !== 'requested') return res.status(400).json({ success: false, message: 'Booking not available' });

    // mark booking accepted
    booking.status = 'accepted';
    await booking.save();

    // create a Trip record for driver/passenger
    const Trip = require('../models/Trip');
    const trip = await Trip.create({
      booking: booking._id,
      driver: req.user._id,
      passenger: booking.user._id,
      tripType: booking.serviceType === 'ride' ? 'RIDE' : 'ITEM',
      fareAmount: booking.estimatedFare || 0,
      status: 'PENDING_CONFIRMATION'
    });

    // link booking -> trip
    booking.trip = trip._id;
    await booking.save();

    // emit socket event for booking acceptance
    try {
      const io = req.app.get('io');
      if (io) io.to(`booking_${booking._id}`).emit('bookingAccepted', { bookingId: booking._id, trip });
    } catch (e) { console.error('socket emit error', e); }

    res.json({ success: true, message: 'Booking accepted by driver', data: { booking, trip } });
  } catch (err) {
    console.error('accept booking error', err);
    res.status(500).json({ success: false, message: 'Accept failed', error: err.message });
  }
};

// passenger confirms pickup/start for a solo booking
exports.confirmBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    // ensure requester is the booking owner (handle populated user doc or raw ObjectId)
    const bookingOwnerId = booking.user && booking.user._id ? booking.user._id.toString() : booking.user.toString();
    if (bookingOwnerId !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only passenger can confirm' });
    if (booking.status !== 'accepted') return res.status(400).json({ success: false, message: 'Booking not in accepted state' });

    // mark on_trip
    booking.status = 'on_trip';
    await booking.save();

    // update trip if present
    const Trip = require('../models/Trip');
    const trip = booking.trip ? await Trip.findById(booking.trip) : null;
    if (trip) {
      trip.status = 'IN_PROGRESS';
      await trip.save();
    }

    // notify driver via socket
    try { const io = req.app.get('io'); if (io) io.to(`booking_${booking._id}`).emit('bookingConfirmed', { bookingId: booking._id, trip }); } catch(e){}

    res.json({ success: true, message: 'Booking confirmed (on trip)', data: { booking, trip } });
  } catch (err) {
    console.error('confirm booking error', err);
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};

// driver updates solo booking status (arrived/on_trip/completed)
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body; // 'arrived', 'on_trip', 'completed'
    if (!['arrived','on_trip','completed'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    // Only allow if booking is accepted or on_trip depending

    if (status === 'arrived') {
      // no change to booking status; could notify passenger
      try { const io = req.app.get('io'); if (io) io.to(`booking_${booking._id}`).emit('driverArrived', { bookingId: booking._id }); } catch(e){}
      return res.json({ success: true, message: 'Driver arrived notified' });
    }

    if (status === 'on_trip') {
      booking.status = 'on_trip';
      await booking.save();
      if (booking.trip) {
        const Trip = require('../models/Trip');
        const trip = await Trip.findById(booking.trip);
        if (trip) { trip.status = 'IN_PROGRESS'; await trip.save(); }
      }
      try { const io = req.app.get('io'); if (io) io.to(`booking_${booking._id}`).emit('bookingOnTrip', { bookingId: booking._id }); } catch(e){}
      return res.json({ success: true, message: 'Booking set to on_trip' });
    }

    if (status === 'completed') {
      booking.status = 'completed';
      await booking.save();
      if (booking.trip) {
        const Trip = require('../models/Trip');
        const trip = await Trip.findById(booking.trip);
        if (trip) {
           // r4
           await rewardService.addPoints(trip.driver, 50, 'Ride Completed');
           await rewardService.addPoints(trip.passenger, 30, 'Ride Completed');
           // r4

           trip.status = 'COMPLETED'; 
           await trip.save(); }
      }
      try { const io = req.app.get('io'); if (io) io.to(`booking_${booking._id}`).emit('bookingCompleted', { bookingId: booking._id }); } catch(e){}
      return res.json({ success: true, message: 'Booking completed' });
    }

  } catch (err) {
    console.error('update booking status error', err);
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};