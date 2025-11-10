exports.requireDriverRole = (req, res, next) => {
  if (!req.user?.roles?.driver) {
    return res.status(403).json({ success: false, message: 'Driver role required' });
  }
  next();
};
