exports.requireDriverRole = (req, res, next) => {
  if (!req.user?.roles?.driver) {
    return res.status(403).json({ success: false, message: 'Driver role required' });
  }
  next();
};

exports.requirePassengerRole = (req, res, next) => {
  if (!req.user?.roles?.passenger) {
    return res.status(403).json({ success: false, message: 'Passenger role required' });
  }
  next();
};
