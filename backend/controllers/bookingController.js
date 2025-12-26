const { autocomplete } = require('../utils/mapService');
const Booking = require('../models/Bookings');
const { haversineDistanceKm } = require('../utils/geo');
const carpoolService = require('../services/carpoolService');



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