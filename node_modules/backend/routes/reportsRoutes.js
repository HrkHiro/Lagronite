const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  listAllReportsAdmin,
  listMyReports,
  getReportDetails,
  updateReportAdmin,
  updateReport,
  deleteReportAdmin,
  deleteReport,
} = require('../controllers/reportsController');

const router = express.Router();

router.get('/admin', protect, restrictTo('admin'), listAllReportsAdmin);
router.put('/admin/:reportType/:reportId', protect, restrictTo('admin'), updateReportAdmin);
router.delete('/admin/:reportType/:reportId', protect, restrictTo('admin'), deleteReportAdmin);

router.use(protect, restrictTo('student'));

router.get('/', listMyReports);
router.get('/:reportType/:reportId', getReportDetails);
router.put('/:reportType/:reportId', updateReport);
router.delete('/:reportType/:reportId', deleteReport);

module.exports = router;
