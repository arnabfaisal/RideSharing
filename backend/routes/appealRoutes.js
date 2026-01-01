const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * DRIVER submits appeal (PUBLIC — no login required)
 */
router.post('/', async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        message: 'Email and appeal message are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.roles?.driver) {
      return res.status(403).json({
        message: 'Only drivers can appeal',
      });
    }

    if (!user.isSuspended) {
      return res.status(400).json({
        message: 'Account is not suspended',
      });
    }

    if (user.appealCount >= 2) {
      return res.status(403).json({
        message: 'Appeal limit reached',
      });
    }

    if (user.appealStatus === 'pending') {
      return res.status(400).json({
        message: 'Appeal already pending',
      });
    }

    user.appealMessage = message;
    user.appealStatus = 'pending';
    user.appealCount += 1;

    await user.save();

    // 🔔 Notify admins in real time
    const io = req.app.get('io');
    if (io) {
      io.emit('appeal:new', {
        userId: user._id,
        email: user.email,
        message: user.appealMessage,
      });
    }

    return res.json({
      success: true,
      message: 'Appeal submitted successfully',
    });
  } catch (err) {
    console.error('Appeal submission error:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

/**
 * ADMIN: get all pending appeals
 */
router.get('/', protect, requireAdmin, async (req, res) => {
  try {
    const appeals = await User.find({
      appealStatus: 'pending',
    }).select(
      'email appealMessage appealCount suspendedUntil isSuspended'
    );

    return res.json(appeals);
  } catch (err) {
    console.error('Fetch appeals error:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

/**
 * ADMIN reviews appeal (approve = unsuspend)
 */
router.put('/:userId/review', protect, requireAdmin, async (req, res) => {
  try {
    const { decision } = req.body; // approved | rejected
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.appealStatus !== 'pending') {
      return res.status(400).json({
        message: 'No pending appeal to review',
      });
    }

    if (decision === 'approved') {
      // ✅ UNSUSPEND DRIVER
      user.isSuspended = false;
      user.suspendedUntil = null;
      user.appealStatus = 'approved';
      user.appealCount = 0; // reset for next suspension
    } else {
      user.appealStatus = 'rejected';
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Appeal reviewed successfully',
    });
  } catch (err) {
    console.error('Appeal review error:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

module.exports = router;
