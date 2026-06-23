const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateLostItem } = require('../middleware/lostItemValidation');
const { createLostItem } = require('../controllers/lostItemController');

const router = express.Router();

router.post('/', protect, restrictTo('student', 'admin'), validateLostItem, createLostItem);

module.exports = router;