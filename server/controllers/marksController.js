/**
 * controllers/marksController.js
 * Full marks management: CRUD, bulk upload, submit/approve/lock
 */
const { query, withTransaction } = require('../config/db');
const { AppError }               = require('../middleware/errorHandler');
const { saveAuditLog }           = require('../models/auditModel');
const { sendNotification }       = require('../services/firebaseService');
const { sendEmail }              = require('../services/emailService');
const XLSX = require('xlsx');

// ── Get marks for a section/subject ──────────────────────────────────────────
async function getSectionMarks(req, res, next) {
  try {
    const { subjectId, sectionId, academicYear = '2024-2025' } = req.query;
    if (!subjectId || !sectionId) throw new AppError('subjectId and sectionId required', 400);

    const rows = await query(
      `SELECT m.*,
              u.first_name, u.last_name, u.email,
              sp.usn,
              CONCAT(sub.first_name, ' ', sub.last_name) AS submitted_by_name,
              CONCAT(apb.first_name, ' ', apb.last_name) AS approved_by_name
       FROM   marks m
       JOIN   users u   ON u.id  = m.student_id
       JOIN   student_profiles sp ON sp.user_id = m.student_id
       LEFT   JOIN users sub ON sub.id = m.submitted_by
       LEFT   JOIN users apb ON apb.id = m.approved_by
       WHERE  m.subject_id = ? AND m.section_id = ? AND m.academic_year = ?
       ORDER  BY sp.usn`,
      [subjectId, sectionId, academicYear]
    );

    // Fetch lock config
    const [lockConfig] = await query(
      `SELECT is_locked, lock_deadline FROM marks_lock_config
       WHERE subject_id = ? AND section_id = ? AND academic_year = ?`,
      [subjectId, sectionId, academicYear]
    );

    res.json({ success: true, data: { rows, lockConfig: lockConfig || null } });
  } catch (err) { next(err); }
}

// ── Get marks for a single student ───────────────────────────────────────────
async function getStudentMarks(req, res, next) {
  try {
    const studentId    = req.params.studentId || req.user.id;
    const { academicYear = '2024-2025', semesterId } = req.query;

    // Students can only view their own marks
    if (req.user.role === 'student' && parseInt(studentId, 10) !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const conditions = ['m.student_id = ?', 'm.academic_year = ?'];
    const params     = [studentId, academicYear];
    if (semesterId) { conditions.push('m.semester_id = ?'); params.push(semesterId); }

    const rows = await query(
      `SELECT m.*,
              s.name AS subject_name, s.code AS subject_code,
              s.subject_type, s.credits,
              s.max_cie1, s.max_cie2, s.max_cie3,
              s.max_assignment1, s.max_assignment2, s.max_lab_internal,
              s.max_attendance_marks,
              sem.label AS semester_label,
              asum.attendance_pct
       FROM   marks m
       JOIN   subjects s   ON s.id   = m.subject_id
       JOIN   semesters sem ON sem.id = m.semester_id
       LEFT   JOIN attendance_summary asum
              ON  asum.student_id = m.student_id
              AND asum.subject_id = m.subject_id
              AND asum.section_id = m.section_id
              AND asum.academic_year = m.academic_year
       WHERE  ${conditions.join(' AND ')}
       ORDER  BY s.code`,
      params
    );

    res.json({ success: true, data: { rows } });
  } catch (err) { next(err); }
}

// ── Upsert marks for a student (professor only) ───────────────────────────────
async function upsertMarks(req, res, next) {
  try {
    const {
      studentId, subjectId, sectionId, semesterId,
      academicYear = '2024-2025',
      cie1, cie2, cie3,
      assignment1, assignment2,
      labInternal, attendanceMarks,
      remarks,
    } = req.body;

    // Check subject limits
    const [subject] = await query(`SELECT * FROM subjects WHERE id = ?`, [subjectId]);
    if (!subject) throw new AppError('Subject not found', 404);

    // Validate score bounds
    const checks = [
      [cie1, subject.max_cie1, 'CIE 1'],
      [cie2, subject.max_cie2, 'CIE 2'],
      [cie3, subject.max_cie3, 'CIE 3'],
      [assignment1, subject.max_assignment1, 'Assignment 1'],
      [assignment2, subject.max_assignment2, 'Assignment 2'],
    ];
    if (subject.subject_type !== 'theory') {
      checks.push([labInternal, subject.max_lab_internal, 'Lab Internal']);
    }
    for (const [val, max, label] of checks) {
      if (val !== undefined && val !== null && (parseFloat(val) < 0 || parseFloat(val) > max)) {
        throw new AppError(`${label} must be between 0 and ${max}`, 400);
      }
    }

    // Check lock
    const [lock] = await query(
      `SELECT is_locked FROM marks_lock_config WHERE subject_id = ? AND section_id = ? AND academic_year = ?`,
      [subjectId, sectionId, academicYear]
    );
    if (lock?.is_locked && !['superadmin', 'admin'].includes(req.user.role)) {
      throw new AppError('Marks are locked for this subject. Contact admin.', 403);
    }

    // Fetch old marks for audit
    const [old] = await query(
      `SELECT * FROM marks WHERE student_id = ? AND subject_id = ? AND section_id = ? AND academic_year = ?`,
      [studentId, subjectId, sectionId, academicYear]
    );

    const params = [
      studentId, subjectId, sectionId, academicYear, semesterId,
      cie1 ?? null, cie2 ?? null, cie3 ?? null,
      assignment1 ?? null, assignment2 ?? null,
      labInternal ?? null, attendanceMarks ?? null,
      remarks || null,
    ];

    await query(
      `INSERT INTO marks (student_id, subject_id, section_id, academic_year, semester_id,
                          cie1, cie2, cie3, assignment1, assignment2, lab_internal, attendance_marks, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         cie1             = COALESCE(VALUES(cie1), cie1),
         cie2             = COALESCE(VALUES(cie2), cie2),
         cie3             = COALESCE(VALUES(cie3), cie3),
         assignment1      = COALESCE(VALUES(assignment1), assignment1),
         assignment2      = COALESCE(VALUES(assignment2), assignment2),
         lab_internal     = COALESCE(VALUES(lab_internal), lab_internal),
         attendance_marks = COALESCE(VALUES(attendance_marks), attendance_marks),
         remarks          = COALESCE(VALUES(remarks), remarks),
         status           = IF(status = 'locked', status, 'draft')`,
      params
    );

    // Marks audit trail
    const fields = ['cie1','cie2','cie3','assignment1','assignment2','lab_internal','attendance_marks'];
    const newVals = { cie1, cie2, cie3, assignment1, assignment2, lab_internal: labInternal, attendance_marks: attendanceMarks };
    for (const field of fields) {
      if (newVals[field] !== undefined && old && String(old[field]) !== String(newVals[field])) {
        await query(
          `INSERT INTO marks_audit (marks_id, changed_by, field_name, old_value, new_value)
           VALUES ((SELECT id FROM marks WHERE student_id=? AND subject_id=? AND section_id=? AND academic_year=?), ?, ?, ?, ?)`,
          [studentId, subjectId, sectionId, academicYear, req.user.id, field, old[field], newVals[field]]
        );
      }
    }

    await saveAuditLog({ userId: req.user.id, action: 'MARKS_UPSERTED', entityType: 'marks', newData: { studentId, subjectId } });
    res.json({ success: true, message: 'Marks saved successfully' });
  } catch (err) { next(err); }
}

// ── Submit marks for approval ─────────────────────────────────────────────────
async function submitMarks(req, res, next) {
  try {
    const { subjectId, sectionId, academicYear = '2024-2025' } = req.body;

    const result = await query(
      `UPDATE marks
       SET    status = 'submitted', submitted_by = ?, submitted_at = NOW()
       WHERE  subject_id = ? AND section_id = ? AND academic_year = ? AND status = 'draft'`,
      [req.user.id, subjectId, sectionId, academicYear]
    );

    // Notify HOD
    await sendNotification({
      topic:   `dept_${req.user.departmentId}`,
      title:   'Marks Submitted for Approval',
      body:    `Professor submitted marks for Subject ID ${subjectId}, Section ID ${sectionId}.`,
      data:    { type: 'marks_submitted', subjectId: String(subjectId) },
    });

    res.json({ success: true, message: `${result.affectedRows} student marks submitted for approval` });
  } catch (err) { next(err); }
}

// ── Approve marks (HOD/Admin) ─────────────────────────────────────────────────
async function approveMarks(req, res, next) {
  try {
    const { subjectId, sectionId, academicYear = '2024-2025', studentIds } = req.body;

    let sql = `UPDATE marks SET status = 'approved', approved_by = ?, approved_at = NOW()
               WHERE subject_id = ? AND section_id = ? AND academic_year = ? AND status = 'submitted'`;
    const params = [req.user.id, subjectId, sectionId, academicYear];

    if (studentIds && studentIds.length) {
      sql += ` AND student_id IN (${studentIds.map(() => '?').join(',')})`;
      params.push(...studentIds);
    }

    const result = await query(sql, params);
    await saveAuditLog({ userId: req.user.id, action: 'MARKS_APPROVED', entityType: 'marks', newData: { subjectId, sectionId } });
    res.json({ success: true, message: `${result.affectedRows} marks approved` });
  } catch (err) { next(err); }
}

// ── Lock / Unlock marks ───────────────────────────────────────────────────────
async function toggleMarkLock(req, res, next) {
  try {
    const { subjectId, sectionId, academicYear = '2024-2025', lock = true, lockDeadline } = req.body;

    await query(
      `INSERT INTO marks_lock_config (subject_id, section_id, academic_year, is_locked, locked_by, locked_at, lock_deadline)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE
         is_locked = VALUES(is_locked),
         locked_by = VALUES(locked_by),
         locked_at = NOW(),
         lock_deadline = VALUES(lock_deadline)`,
      [subjectId, sectionId, academicYear, lock, lock ? req.user.id : null, lockDeadline || null]
    );

    if (lock) {
      await query(
        `UPDATE marks SET status = 'locked'
         WHERE  subject_id = ? AND section_id = ? AND academic_year = ? AND status = 'approved'`,
        [subjectId, sectionId, academicYear]
      );
    }

    res.json({ success: true, message: `Marks ${lock ? 'locked' : 'unlocked'} successfully` });
  } catch (err) { next(err); }
}

// ── Bulk upload marks via Excel ───────────────────────────────────────────────
async function bulkUploadMarks(req, res, next) {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const { subjectId, sectionId, semesterId, academicYear = '2024-2025' } = req.body;

    const wb    = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws    = wb.Sheets[wb.SheetNames[0]];
    const rows  = XLSX.utils.sheet_to_json(ws);

    let saved = 0, errors = [];

    for (const row of rows) {
      try {
        const [student] = await query(
          `SELECT u.id FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.usn = ?`,
          [row.usn || row.USN]
        );
        if (!student) { errors.push({ usn: row.usn, error: 'USN not found' }); continue; }

        await query(
          `INSERT INTO marks (student_id, subject_id, section_id, academic_year, semester_id,
                              cie1, cie2, cie3, assignment1, assignment2, lab_internal, attendance_marks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             cie1 = COALESCE(VALUES(cie1), cie1),
             cie2 = COALESCE(VALUES(cie2), cie2),
             cie3 = COALESCE(VALUES(cie3), cie3),
             assignment1 = COALESCE(VALUES(assignment1), assignment1),
             assignment2 = COALESCE(VALUES(assignment2), assignment2),
             lab_internal = COALESCE(VALUES(lab_internal), lab_internal),
             attendance_marks = COALESCE(VALUES(attendance_marks), attendance_marks)`,
          [
            student.id, subjectId, sectionId, academicYear, semesterId,
            row.cie1 ?? null, row.cie2 ?? null, row.cie3 ?? null,
            row.assignment1 ?? null, row.assignment2 ?? null,
            row.lab_internal ?? row.labInternal ?? null,
            row.attendance_marks ?? null,
          ]
        );
        saved++;
      } catch (e) {
        errors.push({ usn: row.usn, error: e.message });
      }
    }

    res.json({ success: true, message: `${saved} rows processed`, data: { saved, errors } });
  } catch (err) { next(err); }
}

module.exports = {
  getSectionMarks, getStudentMarks, upsertMarks,
  submitMarks, approveMarks, toggleMarkLock, bulkUploadMarks,
};
