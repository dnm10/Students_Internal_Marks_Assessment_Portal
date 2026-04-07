/**
 * routes/marks.js
 */
const router  = require('express').Router();
const { body, query } = require('express-validator');
const multer  = require('multer');
const ctrl    = require('../controllers/marksController');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/rbac');
const { validate }     = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticate);

// GET /api/marks/section — get all marks for a section/subject
router.get('/section',
  query('subjectId').isInt(),
  query('sectionId').isInt(),
  validate,
  authorize('superadmin','admin','hod','professor'),
  ctrl.getSectionMarks
);

// GET /api/marks/student/:studentId
router.get('/student/:studentId', ctrl.getStudentMarks);

// GET /api/marks/me — student's own marks
router.get('/me', authorize('student'), ctrl.getStudentMarks);

// POST /api/marks — create or update marks
router.post('/',
  authorize('superadmin','admin','hod','professor'),
  body('studentId').isInt(),
  body('subjectId').isInt(),
  body('sectionId').isInt(),
  body('semesterId').isInt(),
  validate,
  ctrl.upsertMarks
);

// POST /api/marks/submit — submit for approval
router.post('/submit',
  authorize('professor','admin','superadmin'),
  body('subjectId').isInt(),
  body('sectionId').isInt(),
  validate,
  ctrl.submitMarks
);

// POST /api/marks/approve
router.post('/approve',
  authorize('hod','admin','superadmin'),
  body('subjectId').isInt(),
  body('sectionId').isInt(),
  validate,
  ctrl.approveMarks
);

// POST /api/marks/lock
router.post('/lock',
  authorize('admin','superadmin'),
  body('subjectId').isInt(),
  body('sectionId').isInt(),
  validate,
  ctrl.toggleMarkLock
);

// POST /api/marks/bulk-upload
router.post('/bulk-upload',
  authorize('superadmin','admin','professor'),
  upload.single('file'),
  body('subjectId').isInt(),
  body('sectionId').isInt(),
  validate,
  ctrl.bulkUploadMarks
);

module.exports = router;
