/**
 * routes/reports.js
 */
const router  = require('express').Router();
const ctrl    = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/rbac');

router.use(authenticate);

// GET /api/reports/marksheet/:studentId — PDF marksheet
router.get('/marksheet/:studentId', ctrl.generateMarksheet);

// GET /api/reports/marksheet/me — student's own marksheet
router.get('/marksheet', authorize('student'), (req, res, next) => {
  req.params.studentId = req.user.id;
  ctrl.generateMarksheet(req, res, next);
});

// GET /api/reports/marks/excel — Excel marks export
router.get('/marks/excel',
  authorize('superadmin','admin','hod','professor'),
  ctrl.exportMarksExcel
);

// GET /api/reports/attendance/excel — Excel attendance export
router.get('/attendance/excel',
  authorize('superadmin','admin','hod','professor'),
  ctrl.exportAttendanceExcel
);

// GET /api/reports/analytics — Department analytics
router.get('/analytics',
  authorize('superadmin','admin','hod'),
  ctrl.getDepartmentAnalytics
);

module.exports = router;
