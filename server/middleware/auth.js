/**
 * middleware/auth.js — JWT verification middleware
 */
const jwt    = require('jsonwebtoken');
const { query } = require('../config/db');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Verifies the Bearer JWT from the Authorization header.
 * Attaches `req.user` = { id, email, role, departmentId } on success.
 */
async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists and is active
    const [user] = await query(
      `SELECT u.id, u.email, u.is_active, u.department_id,
              r.name AS role
       FROM   users u
       JOIN   roles r ON r.id = u.role_id
       WHERE  u.id = ?`,
      [decoded.sub]
    );

    if (!user) throw new AppError('User not found', 401);
    if (!user.is_active) throw new AppError('Account deactivated', 403);

    req.user = {
      id:           user.id,
      email:        user.email,
      role:         user.role,
      departmentId: user.department_id,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication — attaches req.user if token present, else continues.
 */
async function optionalAuth(req, _res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();
  return authenticate(req, _res, next);
}

module.exports = { authenticate, optionalAuth };
