const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * DRIVER submits appeal
 * POST /api/appeals
 */
router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const { message } = req.body;

    if (!user.roles.driver) {
      return res.status(403).json({ message: 'Only drivers can appeal' });
    }

    if (!user.isSuspended) {
      return res.status(400).json({ message: 'Account is not suspended' });
    }

    if (user.appealCount >= 2) {
      return res.status(403).json({
        message: 'Appeal limit reached'
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        message: 'Appeal message too short'
      });
    }

    user.appealMessage = message;
    user.appealStatus = 'pending';
    await user.save();

    res.json({
      success: true,
      message: 'Appeal submitted successfully'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ADMIN reviews appeal
 * PUT /api/appeals/:userId
 */
router.put('/:userId', protect, requireAdmin, async (req, res) => {
  try {
    const { decision } = req.body; // approved | rejected
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.appealStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending appeal' });
    }

    if (decision === 'approved') {
      user.isSuspended = false;
      user.suspendedUntil = null;
      user.appealStatus = 'approved';
      user.appealMessage = null;
      await user.save();

      return res.json({
        success: true,
        message: 'Appeal approved — user unsuspended'
      });
    }

    if (decision === 'rejected') {
      user.appealStatus = 'rejected';
      user.appealCount += 1;
      user.appealMessage = null;
      await user.save();

      return res.json({
        success: true,
        message: 'Appeal rejected'
      });
    }

    res.status(400).json({ message: 'Invalid decision' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
