/**
 * models/userModel.js — Reusable user queries
 */
const { query } = require('../config/db')

async function findByEmail(email) {
  const [user] = await query(
    `SELECT u.*, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ?`,
    [email]
  )
  return user || null
}

async function findById(id) {
  const [user] = await query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
            u.profile_photo_url, u.department_id, u.is_active, u.is_email_verified,
            u.last_login_at, u.created_at, r.name AS role
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
    [id]
  )
  return user || null
}

async function getUsersCount({ roleId, departmentId, isActive = true } = {}) {
  const conditions = ['is_active = ?']
  const params     = [isActive]
  if (roleId)       { conditions.push('role_id = ?');       params.push(roleId) }
  if (departmentId) { conditions.push('department_id = ?'); params.push(departmentId) }
  const [{ count }] = await query(
    `SELECT COUNT(*) AS count FROM users WHERE ${conditions.join(' AND ')}`,
    params
  )
  return parseInt(count)
}

module.exports = { findByEmail, findById, getUsersCount }
