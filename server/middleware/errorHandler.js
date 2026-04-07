/**
 * middleware/errorHandler.js — Global error handler middleware
 */
const logger = require('../utils/logger');

/**
 * Centralised error handler — must be registered LAST in app.js
 */
function errorHandler(err, req, res, _next) {
  // Log the full stack in non-production
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err.stack || err.message);
  } else {
    logger.error(`${err.name}: ${err.message}`);
  }

  // Determine HTTP status
  const status = err.statusCode || err.status || 500;

  // Validation errors (express-validator)
  if (err.name === 'ValidationError' && err.errors) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  err.errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry — record already exists' });
  }

  // MySQL foreign key violation
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referenced record does not exist' });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large' });
  }

  // Generic error
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === 500
      ? 'An internal server error occurred'
      : err.message || 'Internal Server Error',
  });
}

/**
 * Helper to create consistent API errors with a status code.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name       = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
