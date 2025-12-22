const Booking = require('../models/Bookings');
const CarpoolGroup = require('../models/CarpoolGroup');
const { haversineDistanceKm } = require('../utils/geo');

// Configuration
const MAX_GROUP_SIZE = 3;
const PICKUP_RADIUS_KM = 3; // consider pickups within 3 km
const DEST_RADIUS_KM = 4; // destinations within 4 km

async function computeCentroid(points) {
  if (!points.length) return null;
  const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lon = points.reduce((s, p) => s + p.lon, 0) / points.length;
  return { lat, lon };
}

// attempt to group the provided booking with other open carpool bookings
async function attemptGroup(booking) {
  if (!booking.carpool) return null;

  // find candidates: carpool true, requested, not same id
  const candidates = await Booking.find({ carpool: true, status: 'requested', _id: { $ne: booking._id } }).limit(50);

  const matches = [];
  for (const c of candidates) {
    const d1 = haversineDistanceKm(booking.pickup.lat, booking.pickup.lon, c.pickup.lat, c.pickup.lon);
    const d2 = haversineDistanceKm(booking.destination.lat, booking.destination.lon, c.destination.lat, c.destination.lon);
    if (d1 <= PICKUP_RADIUS_KM && d2 <= DEST_RADIUS_KM) {
      matches.push(c);
    }
    if (matches.length >= (MAX_GROUP_SIZE - 1)) break;
  }

  const groupBookings = [booking, ...matches];

  if (groupBookings.length < 2) return null; // need at least 2 to carpool

  // calculate fares: sum of estimated fares
  const sumEstimated = groupBookings.reduce((s, b) => s + (b.estimatedFare || 0), 0);

  // apply group discount: 20% off per extra passenger capped at 50%
  const discount = Math.min(0.2 * (groupBookings.length - 1), 0.5);
  const totalFare = Math.round((sumEstimated * (1 - discount)) * 100) / 100;

  // split proportionally by each booking's estimated fare
  const splitFares = {};
  for (const b of groupBookings) {
    const share = sumEstimated > 0 ? (b.estimatedFare / sumEstimated) * totalFare : totalFare / groupBookings.length;
    splitFares[b._id.toString()] = Math.round(share * 100) / 100;
  }

  const pickupCentroid = await computeCentroid(groupBookings.map(b => ({ lat: b.pickup.lat, lon: b.pickup.lon })) );
  const destinationCentroid = await computeCentroid(groupBookings.map(b => ({ lat: b.destination.lat, lon: b.destination.lon })) );

  const group = await CarpoolGroup.create({
    bookings: groupBookings.map(b => b._id),
    pickupCentroid,
    destinationCentroid,
    totalFare,
    splitFares
  });

  // mark bookings as part of group and set passengerFare
  for (const b of groupBookings) {
    const fare = splitFares[b._id.toString()];
    await Booking.findByIdAndUpdate(b._id, { $set: { carpool: true, status: 'requested', carpoolGroup: group._id, passengerFare: fare } }).catch(()=>{});
  }

  return group;
}

async function getOpenGroups() {
  return CarpoolGroup.find({ status: 'open' }).populate({ path: 'bookings', populate: { path: 'user', select: 'name email rating' } });
}

module.exports = {
  attemptGroup,
  getOpenGroups
};
