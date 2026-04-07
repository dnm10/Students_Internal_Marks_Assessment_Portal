/**
 * controllers/reportController.js
 * Generate PDF marksheets and Excel reports
 */
const PDFDocument   = require('pdfkit');
const XLSX          = require('xlsx');
const { query }     = require('../config/db');
const { AppError }  = require('../middleware/errorHandler');
const { uploadToS3 } = require('../services/s3Service');

// ── Generate PDF Marksheet for a student ─────────────────────────────────────
async function generateMarksheet(req, res, next) {
  try {
    const studentId   = req.params.studentId || req.user.id;
    const { academicYear = '2024-2025', semesterId } = req.query;

    if (req.user.role === 'student' && parseInt(studentId, 10) !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Fetch student info
    const [student] = await query(
      `SELECT u.first_name, u.last_name, u.email, sp.usn,
              b.name AS branch_name, sec.name AS section_name,
              sp.current_semester, sp.admission_year
       FROM   users u
       JOIN   student_profiles sp ON sp.user_id = u.id
       JOIN   branches b  ON b.id  = sp.branch_id
       JOIN   sections sec ON sec.id = sp.section_id
       WHERE  u.id = ?`,
      [studentId]
    );
    if (!student) throw new AppError('Student not found', 404);

    // Fetch marks
    const marksRows = await query(
      `SELECT m.cie1, m.cie2, m.cie3, m.assignment1, m.assignment2,
              m.lab_internal, m.attendance_marks, m.total, m.status,
              s.name AS subject_name, s.code, s.credits, s.subject_type,
              s.max_cie1, s.max_cie2, s.max_cie3, s.max_assignment1,
              s.max_assignment2, s.max_lab_internal, s.max_attendance_marks,
              sem.label AS semester_label
       FROM   marks m
       JOIN   subjects s    ON s.id   = m.subject_id
       JOIN   semesters sem ON sem.id = m.semester_id
       WHERE  m.student_id = ? AND m.academic_year = ?
       ${semesterId ? 'AND m.semester_id = ?' : ''}
       ORDER  BY s.code`,
      semesterId ? [studentId, academicYear, semesterId] : [studentId, academicYear]
    );

    // Build PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold')
         .text(process.env.COLLEGE_NAME || 'Student Internal Marks Portal', { align: 'center' });
      doc.fontSize(14).font('Helvetica')
         .text('Internal Assessment Marksheet', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Student details
      doc.fontSize(11).font('Helvetica-Bold').text('Student Information');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Name:         ${student.first_name} ${student.last_name}`);
      doc.text(`USN:          ${student.usn}`);
      doc.text(`Branch:       ${student.branch_name}`);
      doc.text(`Section:      ${student.section_name}`);
      doc.text(`Academic Year: ${academicYear}`);
      doc.moveDown(1);

      // Marks table header
      const cols = { code: 50, name: 150, c1: 30, c2: 30, c3: 30, a1: 30, a2: 30, lab: 35, att: 30, total: 45 };
      const startX = 50;
      let y = doc.y;

      doc.font('Helvetica-Bold').fontSize(8);
      doc.text('Code',    startX, y);
      doc.text('Subject', startX + cols.code, y, { width: cols.name });
      doc.text('C1',      startX + cols.code + cols.name, y);
      doc.text('C2',      startX + cols.code + cols.name + cols.c1, y);
      doc.text('C3',      startX + cols.code + cols.name + cols.c1 + cols.c2, y);
      doc.text('A1',      startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3, y);
      doc.text('A2',      startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1, y);
      doc.text('Lab',     startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1 + cols.a2, y);
      doc.text('Att',     startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1 + cols.a2 + cols.lab, y);
      doc.text('Total',   startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1 + cols.a2 + cols.lab + cols.att, y);

      y += 14;
      doc.moveTo(startX, y).lineTo(545, y).stroke();
      y += 4;

      doc.font('Helvetica').fontSize(8);
      for (const m of marksRows) {
        doc.text(m.code,        startX, y);
        doc.text(m.subject_name, startX + cols.code, y, { width: cols.name - 2 });
        doc.text(m.cie1 ?? '-', startX + cols.code + cols.name, y);
        doc.text(m.cie2 ?? '-', startX + cols.code + cols.name + cols.c1, y);
        doc.text(m.cie3 ?? '-', startX + cols.code + cols.name + cols.c1 + cols.c2, y);
        doc.text(m.assignment1 ?? '-', startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3, y);
        doc.text(m.assignment2 ?? '-', startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1, y);
        doc.text(m.lab_internal ?? '-', startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1 + cols.a2, y);
        doc.text(m.attendance_marks ?? '-', startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1 + cols.a2 + cols.lab, y);
        doc.text(m.total ?? '-', startX + cols.code + cols.name + cols.c1 + cols.c2 + cols.c3 + cols.a1 + cols.a2 + cols.lab + cols.att, y);
        y += 14;
        if (y > 740) { doc.addPage(); y = 50; }
      }

      doc.moveTo(startX, y).lineTo(545, y).stroke();
      y += 10;
      doc.fontSize(7).text(`Generated: ${new Date().toLocaleString('en-IN')}`, startX, y, { align: 'right' });

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="marksheet_${student.usn}_${academicYear}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) { next(err); }
}

// ── Export section marks to Excel ─────────────────────────────────────────────
async function exportMarksExcel(req, res, next) {
  try {
    const { subjectId, sectionId, academicYear = '2024-2025' } = req.query;

    const rows = await query(
      `SELECT sp.usn,
              CONCAT(u.first_name, ' ', u.last_name) AS name,
              m.cie1, m.cie2, m.cie3, m.assignment1, m.assignment2,
              m.lab_internal, m.attendance_marks, m.total, m.status,
              s.name AS subject, s.code
       FROM   marks m
       JOIN   users u ON u.id = m.student_id
       JOIN   student_profiles sp ON sp.user_id = m.student_id
       JOIN   subjects s ON s.id = m.subject_id
       WHERE  m.subject_id = ? AND m.section_id = ? AND m.academic_year = ?
       ORDER  BY sp.usn`,
      [subjectId, sectionId, academicYear]
    );

    const wsData = [
      ['USN', 'Name', 'CIE 1', 'CIE 2', 'CIE 3', 'Asgn 1', 'Asgn 2', 'Lab', 'Attendance', 'Total', 'Status'],
      ...rows.map(r => [r.usn, r.name, r.cie1, r.cie2, r.cie3, r.assignment1, r.assignment2, r.lab_internal, r.attendance_marks, r.total, r.status]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Marks');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="marks_${subjectId}_${sectionId}_${academicYear}.xlsx"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

// ── Export attendance to Excel ─────────────────────────────────────────────────
async function exportAttendanceExcel(req, res, next) {
  try {
    const { subjectId, sectionId, academicYear = '2024-2025' } = req.query;

    const rows = await query(
      `SELECT sp.usn,
              CONCAT(u.first_name, ' ', u.last_name) AS name,
              asum.total_classes, asum.classes_attended, asum.attendance_pct,
              s.name AS subject_name
       FROM   attendance_summary asum
       JOIN   users u ON u.id = asum.student_id
       JOIN   student_profiles sp ON sp.user_id = asum.student_id
       JOIN   subjects s ON s.id = asum.subject_id
       WHERE  asum.subject_id = ? AND asum.section_id = ? AND asum.academic_year = ?
       ORDER  BY sp.usn`,
      [subjectId, sectionId, academicYear]
    );

    const wsData = [
      ['USN', 'Name', 'Total Classes', 'Attended', 'Attendance %', 'Status'],
      ...rows.map(r => [r.usn, r.name, r.total_classes, r.classes_attended, r.attendance_pct,
        r.attendance_pct < 75 ? 'SHORTAGE' : 'OK']),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${subjectId}_${sectionId}.xlsx"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

// ── Department analytics ───────────────────────────────────────────────────────
async function getDepartmentAnalytics(req, res, next) {
  try {
    const { departmentId, academicYear = '2024-2025' } = req.query;
    const deptId = departmentId || req.user.departmentId;

    const subjectStats = await query(
      `SELECT s.name AS subject_name, s.code,
              ROUND(AVG(m.total), 2) AS avg_total,
              ROUND(AVG(m.cie1), 2)  AS avg_cie1,
              ROUND(AVG(m.cie2), 2)  AS avg_cie2,
              ROUND(AVG(m.cie3), 2)  AS avg_cie3,
              COUNT(m.id)            AS student_count,
              SUM(m.status = 'approved') AS approved_count,
              SUM(m.status = 'submitted') AS pending_count
       FROM   marks m
       JOIN   subjects s ON s.id = m.subject_id
       JOIN   branches b ON b.id = s.branch_id
       WHERE  b.department_id = ? AND m.academic_year = ?
       GROUP  BY s.id
       ORDER  BY s.code`,
      [deptId, academicYear]
    );

    const attendanceStats = await query(
      `SELECT s.name AS subject_name,
              ROUND(AVG(asum.attendance_pct), 2) AS avg_pct,
              SUM(asum.attendance_pct < 75) AS below75_count
       FROM   attendance_summary asum
       JOIN   subjects s ON s.id = asum.subject_id
       JOIN   branches b ON b.id = s.branch_id
       WHERE  b.department_id = ? AND asum.academic_year = ?
       GROUP  BY s.id`,
      [deptId, academicYear]
    );

    res.json({ success: true, data: { subjectStats, attendanceStats } });
  } catch (err) { next(err); }
}

module.exports = { generateMarksheet, exportMarksExcel, exportAttendanceExcel, getDepartmentAnalytics };
