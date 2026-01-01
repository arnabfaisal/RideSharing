const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Points = require('../models/Points');
const BlacklistedToken = require('../models/BlacklistedToken');
const { isUniversityEmail } = require('../utils/validators');
const rewardService = require('../services/rewardService');


/* =======================
   JWT SIGN
======================= */
const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
};


/* =======================
   REGISTER
======================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, roles, vehicle, adminSecret } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email and password are required',
      });
    }


    // enforce .edu email
    if (!isUniversityEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Registration allowed only with a .edu university email',
      });
    }


    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }


    // roles (safe defaults)
    const roleObj = {
      passenger: true,
      driver: false,
      admin: false,
    };


    if (roles) {
      if (typeof roles === 'string') {
        roleObj.driver = roles === 'driver' || roles === 'both';
        roleObj.passenger = roles === 'passenger' || roles === 'both';
      } else if (typeof roles === 'object') {
        roleObj.driver = !!roles.driver;
        roleObj.passenger = !!roles.passenger;
      }
    }


    // admin creation via secret
    if (
      adminSecret &&
      adminSecret === process.env.ADMIN_SECRET_PASSWORD
    ) {
      roleObj.admin = true;
    }


    // driver requires vehicle
    if (roleObj.driver && !vehicle) {
      return res.status(400).json({
        success: false,
        message: 'Driver registration requires vehicle details',
      });
    }


    const user = await User.create({
      name,
      email,
      password,
      roles: roleObj,
      vehicle: roleObj.driver ? vehicle : null,
    });


    res.status(201).json({
      success: true,
      message: 'User registered',
      data: {
        id: user._id,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Registration error',
      error: err.message,
    });
  }
};


/* =======================
   LOGIN
======================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }


    // 🔴 IMPORTANT: select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }


    // clear expired suspension
    if (
      user.isSuspended &&
      user.suspendedUntil instanceof Date &&
      Date.now() > user.suspendedUntil.getTime()
    ) {
      user.isSuspended = false;
      user.suspendedUntil = null;
      await user.save();
    }


    // active suspension
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account temporarily suspended',
        suspendedUntil: user.suspendedUntil
          ? user.suspendedUntil.toISOString()
          : null,
        appealCount: user.appealCount || 0,
      });
    }


    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }


    const token = signToken(user._id);


    // wallet (first login only)
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      await Wallet.create({ user: user._id, balance: 0 });
    }


    // points (first login only)
    const points = await Points.findOne({ user: user._id });
    if (!points) {
      await Points.create({
        user: user._id,
        points: 0,
        level: 'Bronze',
      });
    }


    // reward account (idempotent)
    await rewardService.createRewardAccount(user._id);


    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: err.message,
    });
  }
};


/* =======================
   LOGOUT
======================= */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        success: false,
        message: 'Authorization header missing',
      });
    }


    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const exp = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);


    await BlacklistedToken.create({
      token,
      expiresAt: exp,
    });


    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('LOGOUT ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Logout error',
      error: err.message,
    });
  }
};


/* =======================
   GET ME
======================= */
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error',
      error: err.message,
    });
  }
};


/* =======================
   UPDATE ROLES
======================= */
exports.updateRoles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }


    const { roles, vehicle } = req.body || {};
    const roleObj = {
      driver: !!user.roles.driver,
      passenger: !!user.roles.passenger,
      admin: !!user.roles.admin,
    };


    if (roles) {
      if (typeof roles === 'string') {
        roleObj.driver = roles === 'driver' || roles === 'both';
        roleObj.passenger = roles === 'passenger' || roles === 'both';
      } else if (typeof roles === 'object') {
        if (typeof roles.driver === 'boolean') roleObj.driver = roles.driver;
        if (typeof roles.passenger === 'boolean') roleObj.passenger = roles.passenger;
      }
    }


    if (roleObj.driver && !user.vehicle && !vehicle) {
      return res.status(400).json({
        success: false,
        message: 'Driver role requires vehicle details',
      });
    }


    user.roles = roleObj;
    if (vehicle) user.vehicle = vehicle;
    await user.save();


    const safe = user.toObject();
    delete safe.password;


    res.json({
      success: true,
      data: safe,
    });
  } catch (err) {
    console.error('updateRoles error', err);
    res.status(500).json({
      success: false,
      message: 'Failed',
      error: err.message,
    });
  }
};
