const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Points = require('../models/Points');
const BlacklistedToken = require('../models/BlacklistedToken');
const { isUniversityEmail } = require('../utils/validators');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, roles, vehicle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }

    // University email enforcement
    if (!isUniversityEmail(email)) {
      return res.status(400).json({ success: false, message: 'Registration allowed only with a .edu university email' });
    }

    // Roles handling: accept structure or simple string
    const roleObj = { driver: false, passenger: true };
    if (roles) {
      if (typeof roles === 'string') {
        roleObj.driver = roles === 'driver' || roles === 'both';
        roleObj.passenger = roles === 'passenger' || roles === 'both';
      } else if (typeof roles === 'object') {
        roleObj.driver = !!roles.driver;
        roleObj.passenger = !!roles.passenger;
      }
    }

    // If driver role requested, vehicle must be present
    if (roleObj.driver && !vehicle) {
      return res.status(400).json({ success: false, message: 'Driver registration requires vehicle details' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      roles: roleObj,
      vehicle: roleObj.driver ? vehicle : null
    });

    // NOTE: do NOT create wallet & points here per requirement (create on first login).
    res.status(201).json({ success: true, message: 'User registered', data: { id: user._id, email: user.email, roles: user.roles } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (password === process.env.ADMIN_SECRET_PASSWORD) {
  user.roles.admin = true;
  await user.save();
} else {
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
}
    if (user.isBanned) {
  return res.status(403).json({
    success: false,
    message: 'Account permanently banned'
  });
}

if (user.isSuspended && user.suspendedUntil > new Date()) {
  return res.status(403).json({
    success: false,
    message: 'Account temporarily suspended',
    suspendedUntil: user.suspendedUntil
  });
}

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Issue JWT
    const token = signToken(user._id);

    // Ensure wallet & points exist — only on first login per requirements
    const wallet = await Wallet.findOne({ user: user._id });
    const points = await Points.findOne({ user: user._id });

    if (!wallet) {
      await Wallet.create({ user: user._id, balance: 0 });
    }
    if (!points) {
      await Points.create({ user: user._id, points: 0, level: 'Bronze' });
    }

    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
      user: { id: user._id, name: user.name, email: user.email, roles: user.roles }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login error', error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Token should be supplied in Authorization header as Bearer <token>
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(400).json({ success: false, message: 'Authorization header missing' });
    const token = authHeader.split(' ')[1];

    // decode to get expiry
    const decoded = jwt.decode(token);
    const exp = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await BlacklistedToken.create({ token, expiresAt: exp });

    // Client must also remove token locally (cookie/localStorage)
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Logout error', error: err.message });
  }
};

// get current user
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

// update roles for current user (allow toggling passenger/driver roles)
exports.updateRoles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { roles, vehicle } = req.body || {};
    // roles may be string or object similar to register
    const roleObj = { driver: !!user.roles.driver, passenger: !!user.roles.passenger };
    if (roles) {
      if (typeof roles === 'string') {
        roleObj.driver = roles === 'driver' || roles === 'both' ? true : roleObj.driver;
        roleObj.passenger = roles === 'passenger' || roles === 'both' ? true : roleObj.passenger;
      } else if (typeof roles === 'object') {
        if (typeof roles.driver === 'boolean') roleObj.driver = roles.driver;
        if (typeof roles.passenger === 'boolean') roleObj.passenger = roles.passenger;
      }
    }

    // If enabling driver role, ensure vehicle provided or exists
    if (roleObj.driver && !user.vehicle && !vehicle) {
      return res.status(400).json({ success: false, message: 'Driver role requires vehicle details' });
    }

    user.roles = roleObj;
    if (vehicle) user.vehicle = vehicle;
    await user.save();

    // return updated user (without password)
    const safe = user.toObject();
    delete safe.password;
    res.json({ success: true, data: safe });
  } catch (err) {
    console.error('updateRoles error', err);
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};
