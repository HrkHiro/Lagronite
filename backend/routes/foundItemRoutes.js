const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createFoundItem, previewFoundItem } = require('../controllers/foundItemController');

const router = express.Router();

router.post('/preview', protect, restrictTo('student', 'admin'), previewFoundItem);
router.post('/', protect, restrictTo('student', 'admin'), createFoundItem);

module.exports = router;