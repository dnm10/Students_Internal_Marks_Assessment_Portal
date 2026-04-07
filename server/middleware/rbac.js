/**
 * middleware/rbac.js — Role-Based Access Control
 */
const { AppError } = require('./errorHandler');

/**
 * Returns middleware that checks req.user.role against allowed roles.
 * @param {...string} roles  e.g. authorize('superadmin','admin')
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(
        `Access denied: requires one of [${roles.join(', ')}]`, 403
      ));
    }
    next();
  };
}

/**
 * Middleware: ensure professor can only access their own assigned subjects.
 * Attach subject's section via query param or body beforehand if needed.
 */
function ownDataOnly(req, _res, next) {
  // Students can only access their own data
  if (req.user.role === 'student') {
    const requestedId = parseInt(req.params.studentId || req.query.studentId, 10);
    if (requestedId && requestedId !== req.user.id) {
      return next(new AppError('You can only access your own data', 403));
    }
  }
  next();
}

module.exports = { authorize, ownDataOnly };
