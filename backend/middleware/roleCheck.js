// backend/middleware/roleCheck.js

exports.requireDriverRole = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.driver) {
    return res.status(403).json({
      success: false,
      message: 'Driver role required'
    });
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};
