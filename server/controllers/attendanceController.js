/**
 * controllers/attendanceController.js
 * Mark attendance, auto-update summary, trigger email alerts
 */
const { query, withTransaction } = require('../config/db');
const { AppError }               = require('../middleware/errorHandler');
const { saveAuditLog }           = require('../models/auditModel');
const { sendEmail }              = require('../services/emailService');

// ── Mark attendance for a class session ──────────────────────────────────────
async function markAttendance(req, res, next) {
  try {
    const { subjectId, sectionId, date, attendance } = req.body;
    // attendance: [{ studentId, status: 'present'|'absent'|'late'|'excused', remarks }]

    if (!Array.isArray(attendance) || !attendance.length) {
      throw new AppError('attendance array is required', 400);
    }

    await withTransaction(async (conn) => {
      for (const entry of attendance) {
        const { studentId, status = 'present', remarks } = entry;

        // Upsert attendance record
        await conn.execute(
          `INSERT INTO attendance (student_id, subject_id, section_id, marked_by, date, status, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), marked_by = VALUES(marked_by)`,
          [studentId, subjectId, sectionId, req.user.id, date, status, remarks || null]
        );

        // Recalculate summary
        const [[summary]] = await conn.execute(
          `SELECT
             COUNT(*) AS total,
             SUM(status IN ('present','late')) AS attended
           FROM attendance
           WHERE student_id = ? AND subject_id = ? AND section_id = ?`,
          [studentId, subjectId, sectionId]
        );

        await conn.execute(
          `INSERT INTO attendance_summary
             (student_id, subject_id, section_id, academic_year, total_classes, classes_attended)
           VALUES (?, ?, ?, '2024-2025', ?, ?)
           ON DUPLICATE KEY UPDATE
             total_classes    = VALUES(total_classes),
             classes_attended = VALUES(classes_attended)`,
          [studentId, subjectId, sectionId, summary.total, summary.attended || 0]
        );
      }
    });

    // Check for students below 75% and send alerts
    await checkAttendanceAlerts(subjectId, sectionId);

    await saveAuditLog({
      userId: req.user.id, action: 'ATTENDANCE_MARKED',
      entityType: 'attendance', newData: { subjectId, sectionId, date, count: attendance.length },
    });

    res.json({ success: true, message: `Attendance marked for ${attendance.length} students` });
  } catch (err) { next(err); }
}

// ── Get attendance for a section/subject ─────────────────────────────────────
async function getSectionAttendance(req, res, next) {
  try {
    const { subjectId, sectionId, startDate, endDate } = req.query;
    if (!subjectId || !sectionId) throw new AppError('subjectId and sectionId required', 400);

    let dateFilter = '';
    const params   = [subjectId, sectionId];
    if (startDate) { dateFilter += ' AND a.date >= ?'; params.push(startDate); }
    if (endDate)   { dateFilter += ' AND a.date <= ?'; params.push(endDate); }

    const rows = await query(
      `SELECT a.date, a.status, a.remarks,
              u.id AS student_id, u.first_name, u.last_name, sp.usn,
              asum.attendance_pct
       FROM   attendance a
       JOIN   users u ON u.id = a.student_id
       JOIN   student_profiles sp ON sp.user_id = a.student_id
       LEFT   JOIN attendance_summary asum
              ON  asum.student_id = a.student_id
              AND asum.subject_id = a.subject_id
              AND asum.section_id = a.section_id
       WHERE  a.subject_id = ? AND a.section_id = ? ${dateFilter}
       ORDER  BY a.date DESC, sp.usn`,
      params
    );

    res.json({ success: true, data: { rows } });
  } catch (err) { next(err); }
}

// ── Get attendance summary for a section ─────────────────────────────────────
async function getSectionAttendanceSummary(req, res, next) {
  try {
    const { subjectId, sectionId, academicYear = '2024-2025' } = req.query;

    const rows = await query(
      `SELECT asum.*,
              u.first_name, u.last_name, u.email, sp.usn
       FROM   attendance_summary asum
       JOIN   users u  ON u.id  = asum.student_id
       JOIN   student_profiles sp ON sp.user_id = asum.student_id
       WHERE  asum.subject_id = ? AND asum.section_id = ? AND asum.academic_year = ?
       ORDER  BY asum.attendance_pct ASC`,
      [subjectId, sectionId, academicYear]
    );

    const below75 = rows.filter(r => parseFloat(r.attendance_pct) < 75);
    res.json({ success: true, data: { rows, below75Count: below75.length } });
  } catch (err) { next(err); }
}

// ── Get student's own attendance ──────────────────────────────────────────────
async function getStudentAttendance(req, res, next) {
  try {
    const studentId = req.params.studentId || req.user.id;

    if (req.user.role === 'student' && parseInt(studentId, 10) !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const { academicYear = '2024-2025' } = req.query;

    const rows = await query(
      `SELECT asum.*,
              s.name AS subject_name, s.code AS subject_code, s.credits
       FROM   attendance_summary asum
       JOIN   subjects s ON s.id = asum.subject_id
       WHERE  asum.student_id = ? AND asum.academic_year = ?`,
      [studentId, academicYear]
    );

    res.json({ success: true, data: { rows } });
  } catch (err) { next(err); }
}

// ── Get attendance dates for bulk editing ───────────────────────────────────
async function getAttendanceDates(req, res, next) {
  try {
    const { subjectId, sectionId } = req.query;
    const dates = await query(
      `SELECT DISTINCT date, COUNT(*) AS students_marked
       FROM attendance WHERE subject_id = ? AND section_id = ?
       GROUP BY date ORDER BY date DESC`,
      [subjectId, sectionId]
    );
    res.json({ success: true, data: { dates } });
  } catch (err) { next(err); }
}

// ── Internal helper: send email alerts for low attendance ─────────────────────
async function checkAttendanceAlerts(subjectId, sectionId) {
  try {
    const lowStudents = await query(
      `SELECT u.email, u.first_name, u.last_name, sp.usn,
              asum.attendance_pct, asum.total_classes, asum.classes_attended,
              s.name AS subject_name
       FROM   attendance_summary asum
       JOIN   users u ON u.id = asum.student_id
       JOIN   student_profiles sp ON sp.user_id = asum.student_id
       JOIN   subjects s ON s.id = asum.subject_id
       WHERE  asum.subject_id = ? AND asum.section_id = ? AND asum.attendance_pct < 75`,
      [subjectId, sectionId]
    );

    for (const student of lowStudents) {
      await sendEmail({
        to:      student.email,
        subject: `⚠️ Low Attendance Alert: ${student.subject_name}`,
        html: `
          <h2>Dear ${student.first_name} ${student.last_name},</h2>
          <p>Your attendance in <strong>${student.subject_name}</strong> is
             <strong style="color:red">${student.attendance_pct}%</strong>.</p>
          <p>You have attended <strong>${student.classes_attended}</strong> of
             <strong>${student.total_classes}</strong> classes.</p>
          <p>Minimum required attendance is <strong>75%</strong>.
             Please improve your attendance to avoid eligibility issues.</p>
          <p>Contact your professor or HOD for any academic concerns.</p>
          <br/>
          <em>${process.env.COLLEGE_NAME || 'Student Portal'}</em>
        `,
      }).catch(() => {}); // Don't block on email errors
    }
  } catch {
    // Silent — alerts are best-effort
  }
}

module.exports = {
  markAttendance, getSectionAttendance, getSectionAttendanceSummary,
  getStudentAttendance, getAttendanceDates,
};
