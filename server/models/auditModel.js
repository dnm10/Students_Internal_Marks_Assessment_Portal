/**
 * models/auditModel.js — Audit log helpers
 */
const { query } = require('../config/db');

async function saveAuditLog({ userId, action, entityType, entityId, oldData, newData, ipAddress, userAgent }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId     || null,
        action,
        entityType,
        entityId   || null,
        oldData    ? JSON.stringify(oldData) : null,
        newData    ? JSON.stringify(newData) : null,
        ipAddress  || null,
        userAgent  || null,
      ]
    );
  } catch (err) {
    // Audit log failures should not block the main operation
    require('../utils/logger').error('Audit log failed:', err.message);
  }
}

async function getAuditLogs({ page = 1, limit = 50, userId, entityType, action } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (userId)     { conditions.push('al.user_id = ?');     params.push(userId); }
  if (entityType) { conditions.push('al.entity_type = ?'); params.push(entityType); }
  if (action)     { conditions.push('al.action = ?');      params.push(action); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await query(
    `SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name, u.email AS user_email
     FROM   audit_logs al
     LEFT   JOIN users u ON u.id = al.user_id
     ${where}
     ORDER  BY al.created_at DESC
     LIMIT  ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM audit_logs al ${where}`,
    params
  );

  return { rows, total, page, limit };
}

module.exports = { saveAuditLog, getAuditLogs };
