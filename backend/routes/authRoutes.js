const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/me/roles', protect, authController.updateRoles);

module.exports = router;
