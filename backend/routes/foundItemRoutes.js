const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createFoundItem } = require('../controllers/foundItemController');

const router = express.Router();

router.post('/', protect, restrictTo('student', 'admin'), createFoundItem);

module.exports = router;