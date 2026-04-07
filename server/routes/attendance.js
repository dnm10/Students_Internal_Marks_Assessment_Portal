/**
 * routes/attendance.js
 */
const router  = require('express').Router();
const { body, query } = require('express-validator');
const ctrl    = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/rbac');
const { validate }     = require('../middleware/validate');

router.use(authenticate);

// POST /api/attendance — mark attendance
router.post('/',
  authorize('professor','admin','superadmin'),
  body('subjectId').isInt(),
  body('sectionId').isInt(),
  body('date').isDate(),
  body('attendance').isArray({ min: 1 }),
  validate,
  ctrl.markAttendance
);

// GET /api/attendance/section — attendance records
router.get('/section',
  authorize('superadmin','admin','hod','professor'),
  query('subjectId').isInt(),
  query('sectionId').isInt(),
  validate,
  ctrl.getSectionAttendance
);

// GET /api/attendance/section/summary
router.get('/section/summary',
  authorize('superadmin','admin','hod','professor'),
  ctrl.getSectionAttendanceSummary
);

// GET /api/attendance/dates
router.get('/dates',
  authorize('professor','admin','superadmin','hod'),
  ctrl.getAttendanceDates
);

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', ctrl.getStudentAttendance);

// GET /api/attendance/me
router.get('/me', authorize('student'), ctrl.getStudentAttendance);

module.exports = router;
