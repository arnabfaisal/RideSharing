const CarpoolGroup = require('../models/CarpoolGroup');
const carpoolService = require('../services/carpoolService');
const Booking = require('../models/Bookings');

exports.attemptGroupForBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const group = await carpoolService.attemptGroup(booking);
    if (!group) return res.json({ success: true, message: 'No compatible group found', data: null });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    console.error('carpool attempt error', err);
    res.status(500).json({ success: false, message: 'Carpool attempt failed', error: err.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await CarpoolGroup.findById(req.params.id).populate({ path: 'bookings', populate: { path: 'user', select: 'name email rating' } });
    if (!group) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: group });
  } catch (err) {
    console.error('get group error', err);
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};

// driver accepts the group as a unit
exports.acceptGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await CarpoolGroup.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.status !== 'open') return res.status(400).json({ success: false, message: 'Group not available' });

    group.status = 'driver_accepted';
    group.driver = req.user._id;
    group.notified = true; // mark notified so clients can react
    await group.save();

    // mark bookings as accepted
    await Booking.updateMany({ _id: { $in: group.bookings } }, { $set: { status: 'accepted' } });

    // In a real app we'd notify passengers via socket/push; here we just set state
    res.json({ success: true, message: 'Group accepted by driver', data: group });
  } catch (err) {
    console.error('accept group error', err);
    res.status(500).json({ success: false, message: 'Accept failed', error: err.message });
  }
};

exports.listDriverMatches = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon required' });

    const groups = await carpoolService.getOpenGroups();

    // simple scoring using distance, route direction (if provided) and average passenger rating
    const { bearingDegrees, haversineDistanceKm } = require('../utils/geo');
    const driverDestLat = req.query.driverDestLat;
    const driverDestLon = req.query.driverDestLon;

    const scored = groups.map(g => {
      const dist = haversineDistanceKm(parseFloat(lat), parseFloat(lon), g.pickupCentroid?.lat || 0, g.pickupCentroid?.lon || 0);
      const avgRating = (g.bookings.reduce((s, b) => s + (b.user?.rating || 5), 0) / Math.max(1, g.bookings.length));

      // direction penalty: if driver provided destination, prefer groups whose pickup->destination direction aligns
      let directionPenalty = 0;
      if (driverDestLat && driverDestLon && g.pickupCentroid && g.destinationCentroid) {
        try {
          const driverDir = bearingDegrees(parseFloat(lat), parseFloat(lon), parseFloat(driverDestLat), parseFloat(driverDestLon));
          const groupDir = bearingDegrees(g.pickupCentroid.lat, g.pickupCentroid.lon, g.destinationCentroid.lat, g.destinationCentroid.lon);
          let diff = Math.abs(driverDir - groupDir);
          if (diff > 180) diff = 360 - diff;
          // normalize diff to [0..1] by dividing by 180 and scale penalty
          directionPenalty = (diff / 180) * 2; // up to +2 to the score
        } catch (e) { directionPenalty = 0; }
      }

      // score: lower better. Weight distance, penalize direction mismatch, reward rating
      const score = dist + directionPenalty - (avgRating - 4) * 2;
      return { group: g, score, distanceKm: Math.round(dist * 100) / 100, avgRating: Math.round(avgRating*10)/10, directionPenalty: Math.round(directionPenalty*100)/100 };
    }).sort((a,b) => a.score - b.score);

    res.json({ success: true, data: scored });
  } catch (err) {
    console.error('list driver matches error', err);
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};
