/**
 * routes/users.js
 */
const router  = require('express').Router();
const { body } = require('express-validator');
const multer  = require('multer');
const ctrl    = require('../controllers/userController');
const { authenticate }  = require('../middleware/auth');
const { authorize }     = require('../middleware/rbac');
const { validate }      = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// All routes require auth
router.use(authenticate);

// GET /api/users — list users
router.get('/', authorize('superadmin','admin','hod'), ctrl.listUsers);

// GET /api/users/stats — system statistics
router.get('/stats', authorize('superadmin','admin'), ctrl.getSystemStats);

// POST /api/users/bulk-import — import students from Excel
router.post('/bulk-import',
  authorize('superadmin','admin'),
  upload.single('file'),
  ctrl.bulkImportStudents
);

// PATCH /api/users/change-password
router.patch('/change-password',
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate,
  ctrl.changePassword
);

// GET /api/users/:id
router.get('/:id', ctrl.getUserById);

// POST /api/users — create new user
router.post('/',
  authorize('superadmin','admin'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('roleId').isInt({ min: 1 }),
  validate,
  ctrl.createUser
);

// PATCH /api/users/:id
router.patch('/:id', authorize('superadmin','admin'), ctrl.updateUser);

// DELETE /api/users/:id
router.delete('/:id', authorize('superadmin','admin'), ctrl.deleteUser);

module.exports = router;
