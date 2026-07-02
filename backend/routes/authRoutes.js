const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.registerStudent);
router.post('/login', authController.loginStudent);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);

module.exports = router;