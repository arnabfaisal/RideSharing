const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * TEMPORARY SUSPEND USER
 */
router.put('/suspend/:userId', protect, requireAdmin, async (req, res) => {
  try {
    const { days } = req.body;

    if (!days || days <= 0) {
      return res.status(400).json({ message: 'Invalid suspension days' });
    }

    const until = new Date();
    until.setDate(until.getDate() + days);

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isSuspended: true, suspendedUntil: until },
      { new: true }
    );

    res.json({
      success: true,
      message: `User suspended for ${days} days`,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PERMANENT BAN USER
 */
router.put('/ban/:userId', protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'User permanently banned',
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
