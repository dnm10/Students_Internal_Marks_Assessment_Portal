/**
 * utils/constants.js — App-wide constants
 */

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN:      'admin',
  HOD:        'hod',
  PROFESSOR:  'professor',
  STUDENT:    'student',
}

export const MARK_STATUSES = {
  DRAFT:     'draft',
  SUBMITTED: 'submitted',
  APPROVED:  'approved',
  LOCKED:    'locked',
}

export const ATTENDANCE_STATUSES = {
  PRESENT: 'present',
  ABSENT:  'absent',
  LATE:    'late',
  EXCUSED: 'excused',
}

export const SUBJECT_TYPES = {
  THEORY:     'theory',
  LAB:        'lab',
  THEORY_LAB: 'theory_lab',
}

export const ATTENDANCE_MIN_PCT = 75

export const MARKS_MAX = {
  CIE:         30,
  ASSIGNMENT:  10,
  LAB:         25,
  ATTENDANCE:   5,
}

export const NAV_ITEMS = {
  superadmin: [
    { label: 'Dashboard',    path: '/superadmin',          icon: 'LayoutDashboard' },
    { label: 'Manage Users', path: '/superadmin/users',    icon: 'Users' },
    { label: 'Departments',  path: '/superadmin/departments', icon: 'Building2' },
    { label: 'Analytics',    path: '/superadmin/analytics', icon: 'BarChart3' },
    { label: 'Audit Logs',   path: '/superadmin/audit',    icon: 'FileText' },
    { label: 'Settings',     path: '/superadmin/settings', icon: 'Settings' },
  ],
  admin: [
    { label: 'Dashboard',    path: '/admin',               icon: 'LayoutDashboard' },
    { label: 'Departments',  path: '/admin/departments',   icon: 'Building2' },
    { label: 'Students',     path: '/admin/students',      icon: 'GraduationCap' },
    { label: 'Reports',      path: '/admin/reports',       icon: 'FileBarChart' },
    { label: 'Settings',     path: '/admin/settings',      icon: 'Settings' },
  ],
  hod: [
    { label: 'Dashboard',    path: '/hod',                 icon: 'LayoutDashboard' },
    { label: 'Approve Marks',path: '/hod/approve-marks',  icon: 'CheckSquare' },
    { label: 'Analytics',    path: '/hod/analytics',      icon: 'BarChart3' },
    { label: 'Reports',      path: '/hod/reports',        icon: 'FileBarChart' },
    { label: 'Settings',     path: '/hod/settings',      icon: 'Settings' },
  ],
  professor: [
    { label: 'Dashboard',    path: '/professor',           icon: 'LayoutDashboard' },
    { label: 'Marks Entry',  path: '/professor/marks',     icon: 'ClipboardList' },
    { label: 'Attendance',   path: '/professor/attendance', icon: 'CalendarCheck' },
    { label: 'My Subjects',  path: '/professor/subjects',  icon: 'BookOpen' },
    { label: 'Analytics',    path: '/professor/analytics', icon: 'BarChart3' },
    { label: 'Settings',     path: '/professor/settings',      icon: 'Settings' },
  ],
  student: [
    { label: 'Dashboard',    path: '/student',             icon: 'LayoutDashboard' },
    { label: 'My Marks',     path: '/student/marks',       icon: 'ClipboardList' },
    { label: 'Attendance',   path: '/student/attendance',  icon: 'CalendarCheck' },
    { label: 'Marksheet',    path: '/student/marksheet',   icon: 'FileText' },
    { label: 'Settings',     path: '/student/settings',      icon: 'Settings' },
  ],
}

export const ACADEMIC_YEARS = ['2024-2025', '2023-2024', '2022-2023', '2021-2022']
export const CURRENT_ACADEMIC_YEAR = '2024-2025'

export const GRADE_THRESHOLDS = [
  { min: 90, grade: 'O',  label: 'Outstanding', color: 'text-emerald-400' },
  { min: 80, grade: 'A+', label: 'Excellent',   color: 'text-green-400'   },
  { min: 70, grade: 'A',  label: 'Very Good',   color: 'text-blue-400'    },
  { min: 60, grade: 'B+', label: 'Good',        color: 'text-cyan-400'    },
  { min: 50, grade: 'B',  label: 'Average',     color: 'text-yellow-400'  },
  { min: 40, grade: 'C',  label: 'Pass',        color: 'text-orange-400'  },
  { min: 0,  grade: 'F',  label: 'Fail',        color: 'text-red-400'     },
]
