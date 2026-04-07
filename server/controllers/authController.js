/**
 * controllers/authController.js
 * Handles login, refresh, logout, password reset
 */
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { query, withTransaction } = require('../config/db');
const { AppError }               = require('../middleware/errorHandler');
const { sendEmail }              = require('../services/emailService');
const { saveAuditLog }           = require('../models/auditModel');
const logger  = require('../utils/logger');

// ── Token Helpers ─────────────────────────────────────────────────────────────
function generateAccessToken(userId, role) {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    console.log("ENTERED EMAIL:", email);

    const [user] = await query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name,
              u.is_active, u.is_email_verified, u.profile_photo_url, u.department_id,
              r.name AS role
      FROM   users u
      JOIN   roles r ON r.id = u.role_id
      WHERE  u.email = ?`,
      [email.toLowerCase().trim()]
    );

    console.log("USER FROM DB:", user);

    if (user) {
      console.log("HASH FROM DB:", user.password_hash);

      const match = await bcrypt.compare(password, user.password_hash);
      console.log("PASSWORD MATCH:", match);
    }

    if (!user) throw new AppError('Invalid email or password', 401);
    if (!user.is_active) throw new AppError('Your account has been deactivated. Contact admin.', 403);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new AppError('Invalid email or password', 401);

    // Generate tokens
    const accessToken  = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    const refreshHash  = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Store refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
      [user.id, refreshHash, expiresAt]
    );

    // Update last login
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

    // Audit log
    await saveAuditLog({
      userId:     user.id,
      action:     'USER_LOGIN',
      entityType: 'user',
      entityId:   user.id,
      ipAddress:  req.ip,
      userAgent:  req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id:             user.id,
          email:          user.email,
          firstName:      user.first_name,
          lastName:       user.last_name,
          role:           user.role,
          departmentId:   user.department_id,
          profilePhotoUrl: user.profile_photo_url,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Refresh Access Token ───────────────────────────────────────────────────────
async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required', 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [stored]  = await query(
      `SELECT id FROM refresh_tokens
       WHERE  user_id = ? AND token_hash = ? AND expires_at > NOW()`,
      [decoded.sub, tokenHash]
    );
    if (!stored) throw new AppError('Refresh token revoked or expired', 401);

    const [user] = await query(
      `SELECT u.id, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
      [decoded.sub]
    );
    if (!user) throw new AppError('User not found', 401);

    const newAccessToken = generateAccessToken(user.id, user.role);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      await query(`DELETE FROM refresh_tokens WHERE token_hash = ?`, [hash]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Forgot Password ───────────────────────────────────────────────────────────
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const [user]    = await query(`SELECT id, first_name FROM users WHERE email = ?`, [email]);

    // Always return 200 to avoid user enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken   = crypto.randomBytes(32).toString('hex');
    const resetHash    = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?`,
      [resetHash, resetExpires, user.id]
    );

    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to:      email,
      subject: 'Password Reset Request',
      html: `
        <h2>Hello ${user.first_name},</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetURL}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// ── Reset Password ────────────────────────────────────────────────────────────
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [user] = await query(
      `SELECT id FROM users
       WHERE  password_reset_token = ? AND password_reset_expires > NOW()`,
      [tokenHash]
    );
    if (!user) throw new AppError('Token is invalid or has expired', 400);

    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10));
    await query(
      `UPDATE users
       SET    password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL
       WHERE  id = ?`,
      [passwordHash, user.id]
    );

    // Revoke all refresh tokens
    await query(`DELETE FROM refresh_tokens WHERE user_id = ?`, [user.id]);

    res.json({ success: true, message: 'Password reset successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

// ── Get Current User ──────────────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const [user] = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
              u.profile_photo_url, u.department_id, u.is_email_verified,
              u.last_login_at, u.created_at,
              r.name AS role,
              d.name AS department_name
       FROM   users u
       JOIN   roles r ON r.id = u.role_id
       LEFT   JOIN departments d ON d.id = u.department_id
       WHERE  u.id = ?`,
      [req.user.id]
    );
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refreshToken, logout, forgotPassword, resetPassword, getMe };
