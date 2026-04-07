/**
 * utils/helpers.js — Utility functions
 */
import { GRADE_THRESHOLDS } from './constants'

/** Format a date string to localised display */
export const formatDate = (date, opts = {}) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...opts })
    .format(new Date(date))
}

/** Format number to 2 decimal places, return '—' for null/undefined */
export const fmtMark = (val, max) => {
  if (val === null || val === undefined) return '—'
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return max ? `${n.toFixed(1)} / ${max}` : n.toFixed(1)
}

/** Calculate grade from a percentage */
export const getGrade = (percentage) => {
  if (percentage === null || percentage === undefined) return null
  const pct = parseFloat(percentage)
  return GRADE_THRESHOLDS.find(t => pct >= t.min) || GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]
}

/** Calculate attendance grade string */
export const getAttendanceStatus = (pct) => {
  const p = parseFloat(pct)
  if (isNaN(p)) return { label: '—', color: 'text-slate-400' }
  if (p >= 90) return { label: 'Excellent', color: 'text-emerald-400' }
  if (p >= 75) return { label: 'Good',      color: 'text-blue-400'    }
  if (p >= 65) return { label: 'Low',       color: 'text-amber-400'   }
  return         { label: 'Critical',  color: 'text-red-400'     }
}

/** Build status badge props */
export const getStatusBadge = (status) => {
  switch (status) {
    case 'approved': return { label: 'Approved', cls: 'badge-success' }
    case 'submitted':return { label: 'Pending',  cls: 'badge-warning' }
    case 'locked':   return { label: 'Locked',   cls: 'badge-primary' }
    case 'draft':    return { label: 'Draft',    cls: 'badge-gray'    }
    default:         return { label: status,     cls: 'badge-gray'    }
  }
}

/** Capitalise first letter */
export const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1)

/** Truncate long strings */
export const truncate = (str = '', n = 30) => str.length > n ? str.slice(0, n) + '…' : str

/** Convert object to URLSearchParams string */
export const toQueryString = (obj) => new URLSearchParams(
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''))
).toString()

/** Deep clone an object */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

/** Get initials from name */
export const getInitials = (first = '', last = '') =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()

/** Debounce a function */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** Calculate total marks percentage */
export const calcPercentage = (total, max) => {
  if (!max || !total) return 0
  return Math.round((parseFloat(total) / parseFloat(max)) * 100)
}

/** Format file size */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
