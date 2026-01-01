const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


// Public
router.post('/register', authController.register);
router.post('/login', authController.login);


const { protect } = require('../middleware/auth');
// Protected
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/me/roles', protect, authController.updateRoles);

module.exports = router;
