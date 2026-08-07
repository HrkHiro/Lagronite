const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateLostItem } = require('../middleware/lostItemValidation');
const { createLostItem, previewLostItem } = require('../controllers/lostItemController');

const router = express.Router();

router.post('/preview', protect, restrictTo('student', 'admin'), previewLostItem);
router.post('/', protect, restrictTo('student', 'admin'), validateLostItem, createLostItem);

module.exports = router;