/**
 * models/marksModel.js — Reusable marks queries
 */
const { query } = require('../config/db')

async function getMarksByStudent({ studentId, academicYear, semesterId }) {
  const conditions = ['m.student_id = ?', 'm.academic_year = ?']
  const params     = [studentId, academicYear]
  if (semesterId) { conditions.push('m.semester_id = ?'); params.push(semesterId) }
  return query(
    `SELECT m.*, s.name AS subject_name, s.code AS subject_code,
            s.subject_type, s.credits, s.max_cie1, s.max_cie2, s.max_cie3,
            s.max_assignment1, s.max_assignment2, s.max_lab_internal, s.max_attendance_marks,
            sem.label AS semester_label
     FROM marks m
     JOIN subjects s   ON s.id   = m.subject_id
     JOIN semesters sem ON sem.id = m.semester_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY s.code`,
    params
  )
}

async function getMarksBySection({ subjectId, sectionId, academicYear }) {
  return query(
    `SELECT m.*,
            u.first_name, u.last_name, u.email,
            sp.usn,
            CONCAT(sub.first_name,' ',sub.last_name) AS submitted_by_name,
            CONCAT(apb.first_name,' ',apb.last_name) AS approved_by_name
     FROM marks m
     JOIN users u ON u.id = m.student_id
     JOIN student_profiles sp ON sp.user_id = m.student_id
     LEFT JOIN users sub ON sub.id = m.submitted_by
     LEFT JOIN users apb ON apb.id = m.approved_by
     WHERE m.subject_id = ? AND m.section_id = ? AND m.academic_year = ?
     ORDER BY sp.usn`,
    [subjectId, sectionId, academicYear]
  )
}

module.exports = { getMarksByStudent, getMarksBySection }
