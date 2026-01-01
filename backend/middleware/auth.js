const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/BlacklistedToken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Check blacklist
    const black = await BlacklistedToken.findOne({ token });
    if (black) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalidated (logged out)'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    /* ===============================
       🔒 BAN / SUSPENSION CHECKS
       =============================== */

    // Permanent ban
 // Permanent ban (admins are immune)
if (user.isBanned && !user.roles?.admin) {
  return res.status(403).json({
    success: false,
    message: 'Account permanently banned'
  });
}


// Temporary suspension (admins are immune)
if (user.isSuspended && !user.roles?.admin) {
  if (user.suspendedUntil && user.suspendedUntil > new Date()) {
    return res.status(403).json({
      success: false,
      message: 'Account temporarily suspended',
      suspendedUntil: user.suspendedUntil
    });
  }

      // Auto-unsuspend
      if (user.suspendedUntil && user.suspendedUntil <= new Date()) {
        user.isSuspended = false;
        user.suspendedUntil = null;
        await user.save();
      }
    }

    // Attach user
    req.user = user;
    req.tokenExp = decoded.exp ? decoded.exp * 1000 : null;

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: err.message
    });
  }
};
