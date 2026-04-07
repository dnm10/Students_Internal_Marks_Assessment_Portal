/**
 * controllers/userController.js
 * CRUD operations for all user roles (superadmin, admin, hod, professor, student)
 */
const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('../config/db');
const { AppError }               = require('../middleware/errorHandler');
const { saveAuditLog }           = require('../models/auditModel');
const { uploadToS3 }             = require('../services/s3Service');
const XLSX = require('xlsx');

// ── List Users ────────────────────────────────────────────────────────────────
async function listUsers(req, res, next) {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT u.id, u.email, u.first_name, u.last_name,
             r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
    `;

    let countSql = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN roles r ON r.id = u.role_id
    `;

    let conditions = [];
    let params = [];

    if (role) {
      conditions.push("r.name = ?");
      params.push(role);
    }

    if (department) {
      conditions.push("u.department_id = ?");
      params.push(department);
    }

    if (search) {
      conditions.push("(u.first_name LIKE ? OR u.email LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      sql += whereClause;
      countSql += whereClause;
    }

    // ✅ FIXED HERE (NO ? for LIMIT)
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    console.log("FINAL SQL:", sql);
    console.log("FINAL PARAMS:", params);

    const rows = await query(sql, params);

    const countResult = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        rows,
        total,
      },
    });

  } catch (err) {
    next(err);
  }
}

// ── Get Single User ───────────────────────────────────────────────────────────
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const [user] = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
              u.profile_photo_url, u.last_login_at, u.created_at, u.is_email_verified,
              r.name AS role, d.name AS department_name, d.id AS department_id,
              sp.usn, sp.current_semester, sp.admission_year, sp.gender,
              sp.guardian_name, sp.guardian_phone, sp.guardian_email, sp.address,
              b.name AS branch_name, sec.name AS section_name
       FROM   users u
       JOIN   roles r ON r.id = u.role_id
       LEFT   JOIN departments d   ON d.id   = u.department_id
       LEFT   JOIN student_profiles sp ON sp.user_id = u.id
       LEFT   JOIN branches b      ON b.id   = sp.branch_id
       LEFT   JOIN sections sec    ON sec.id = sp.section_id
       WHERE  u.id = ?`,
      [id]
    );
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

// ── Create User ───────────────────────────────────────────────────────────────
async function createUser(req, res, next) {
  try {
    const {
      email, password, firstName, lastName, phone,
      roleId, departmentId,
      // Student-specific
      usn, branchId, sectionId, admissionYear, gender,
      guardianName, guardianPhone, guardianEmail,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10));

    await withTransaction(async (conn) => {
      const [existing] = await conn.execute(`SELECT id FROM users WHERE email = ?`, [email]);
      if (existing.length) throw new AppError('Email already registered', 409);

      const [result] = await conn.execute(
        `INSERT INTO users (role_id, department_id, email, password_hash, first_name, last_name, phone, is_email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [roleId, departmentId || null, email.toLowerCase().trim(), passwordHash, firstName, lastName, phone || null]
      );
      const userId = result.insertId;

      // Fetch role name
      const [[role]] = await conn.execute(`SELECT name FROM roles WHERE id = ?`, [roleId]);

      if (role.name === 'student') {
        if (!usn || !branchId || !sectionId || !admissionYear) {
          throw new AppError('USN, branchId, sectionId, and admissionYear are required for students', 400);
        }
        await conn.execute(
          `INSERT INTO student_profiles (user_id, usn, branch_id, section_id, admission_year, gender, guardian_name, guardian_phone, guardian_email)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, usn, branchId, sectionId, admissionYear, gender || null, guardianName || null, guardianPhone || null, guardianEmail || null]
        );
      }

      await saveAuditLog({ userId: req.user.id, action: 'USER_CREATED', entityType: 'user', entityId: userId, newData: { email, roleId } });

      res.status(201).json({ success: true, message: 'User created successfully', data: { userId } });
    });
  } catch (err) { next(err); }
}

// ── Update User ───────────────────────────────────────────────────────────────
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, departmentId, isActive } = req.body;

    const [existing] = await query(`SELECT id FROM users WHERE id = ?`, [id]);
    if (!existing) throw new AppError('User not found', 404);

    await query(
      `UPDATE users
       SET first_name = COALESCE(?, first_name),
           last_name  = COALESCE(?, last_name),
           phone      = COALESCE(?, phone),
           department_id = COALESCE(?, department_id),
           is_active  = COALESCE(?, is_active)
       WHERE id = ?`,
      [firstName || null, lastName || null, phone || null, departmentId || null,
       isActive !== undefined ? isActive : null, id]
    );

    await saveAuditLog({ userId: req.user.id, action: 'USER_UPDATED', entityType: 'user', entityId: parseInt(id, 10), newData: req.body });
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) { next(err); }
}

// ── Delete (deactivate) User ──────────────────────────────────────────────────
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) throw new AppError('Cannot deactivate yourself', 400);
    await query(`UPDATE users SET is_active = FALSE WHERE id = ?`, [id]);
    await saveAuditLog({ userId: req.user.id, action: 'USER_DEACTIVATED', entityType: 'user', entityId: parseInt(id, 10) });
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) { next(err); }
}

// ── Bulk Import Students via Excel/CSV ────────────────────────────────────────
async function bulkImportStudents(req, res, next) {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const workbook  = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet     = workbook.Sheets[workbook.SheetNames[0]];
    const rows      = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) throw new AppError('Excel file is empty', 400);

    const SALT     = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const DEFAULT_PASS = 'Password@123';
    const passwordHash = await bcrypt.hash(DEFAULT_PASS, SALT);

    let created = 0, skipped = 0, errors = [];

    // Get role_id for student
    const [studentRole] = await query(`SELECT id FROM roles WHERE name = 'student'`);

    for (const row of rows) {
      try {
        const email = (row.email || row.Email || '').toLowerCase().trim();
        if (!email) { skipped++; continue; }

        const [existing] = await query(`SELECT id FROM users WHERE email = ?`, [email]);
        if (existing) { skipped++; continue; }

        await withTransaction(async (conn) => {
          const [result] = await conn.execute(
            `INSERT INTO users (role_id, department_id, email, password_hash, first_name, last_name, phone, is_email_verified)
             VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
              studentRole.id,
              row.department_id || row.departmentId || null,
              email,
              passwordHash,
              row.first_name || row.firstName || row['First Name'] || '',
              row.last_name  || row.lastName  || row['Last Name']  || '',
              row.phone      || row.Phone     || null,
            ]
          );
          const userId = result.insertId;

          await conn.execute(
            `INSERT INTO student_profiles (user_id, usn, branch_id, section_id, admission_year, gender)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              userId,
              row.usn || row.USN,
              row.branch_id || row.branchId,
              row.section_id || row.sectionId,
              row.admission_year || row.admissionYear || new Date().getFullYear(),
              row.gender || row.Gender || null,
            ]
          );
        });
        created++;
      } catch (e) {
        errors.push({ row: JSON.stringify(row), error: e.message });
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Import complete: ${created} created, ${skipped} skipped`,
      data: { created, skipped, errors },
    });
  } catch (err) { next(err); }
}

// ── Change Password ───────────────────────────────────────────────────────────
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const [user] = await query(`SELECT password_hash FROM users WHERE id = ?`, [req.user.id]);
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) throw new AppError('Current password is incorrect', 400);

    const newHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10));
    await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, req.user.id]);
    await query(`DELETE FROM refresh_tokens WHERE user_id = ?`, [req.user.id]);
    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) { next(err); }
}

// ── System Stats (superadmin/admin dashboard) ─────────────────────────────────
async function getSystemStats(req, res, next) {
  try {
    const [stats] = await query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS total_users,
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'student' AND u.is_active = TRUE) AS total_students,
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'professor' AND u.is_active = TRUE) AS total_professors,
        (SELECT COUNT(*) FROM departments WHERE is_active = TRUE) AS total_departments,
        (SELECT COUNT(*) FROM subjects WHERE is_active = TRUE) AS total_subjects,
        (SELECT COUNT(*) FROM marks WHERE status = 'approved') AS marks_approved,
        (SELECT COUNT(*) FROM marks WHERE status = 'submitted') AS marks_pending,
        (SELECT COUNT(*) FROM marks) AS marks_total`
    );
    res.json({ success: true, data: { stats } });
  } catch (err) { next(err); }
}

module.exports = {
  listUsers, getUserById, createUser, updateUser, deleteUser,
  bulkImportStudents, changePassword, getSystemStats,
};
