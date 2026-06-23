const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  listFeed,
  getFeedItem,
  addComment,
  toggleReaction,
} = require('../controllers/feedController');

const router = express.Router();

router.use(protect, restrictTo('student'));

router.get('/', listFeed);
router.get('/:reportType/:reportId', getFeedItem);
router.post('/:reportType/:reportId/comments', addComment);
router.post('/:reportType/:reportId/reactions', toggleReaction);

module.exports = router;
