import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { InfoCard } from '../../components/common/Cards'
import api from '../../utils/api'
import { getAttendanceStatus } from '../../utils/helpers'
import { clsx } from 'clsx'

export default function StudentAttendance() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance/me', { params: { academicYear:'2024-2025' } })
      .then(({ data }) => setData(data.data.rows || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const below75 = data.filter(r => parseFloat(r.attendance_pct) < 75)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Subject-wise attendance summary — 2024-2025</p>
      </div>

      {below75.length > 0 && (
        <div className="glass border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="font-semibold text-sm">Attendance Shortage!</p>
            <p className="text-xs text-red-300/80 mt-1">
              You have below 75% attendance in {below75.length} subject{below75.length>1?'s':''}.
              Please contact your professor immediately.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({length:4}).map((_,i)=>(
            <div key={i} className="glass rounded-xl p-5 space-y-3">
              <div className="skeleton h-4 w-24 rounded"/>
              <div className="skeleton h-3 w-40 rounded"/>
              <div className="skeleton h-2.5 w-full rounded-full"/>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-slate-500">No attendance data available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map(row => {
            const pct    = parseFloat(row.attendance_pct)
            const status = getAttendanceStatus(pct)
            const isLow  = pct < 75
            return (
              <div key={row.subject_code} className={clsx(
                'glass rounded-xl p-5 space-y-3 transition-all',
                isLow ? 'border border-red-500/30' : 'hover:border-primary-500/20'
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <code className="text-xs text-accent-400 font-mono">{row.subject_code}</code>
                    <h3 className="font-semibold text-white text-sm mt-0.5">{row.subject_name}</h3>
                  </div>
                  <div className="text-right">
                    <p className={clsx('text-2xl font-bold', isLow ? 'text-red-400' : 'text-emerald-400')}>
                      {pct.toFixed(1)}%
                    </p>
                    <p className={clsx('text-xs', status.color)}>{status.label}</p>
                  </div>
                </div>

                <div className="flex gap-4 text-xs text-slate-400">
                  <span>{row.classes_attended} / {row.total_classes} classes attended</span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width:`${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>0%</span>
                    <span className={clsx('font-medium', isLow ? 'text-red-500' : 'text-emerald-500')}>75% required</span>
                    <span>100%</span>
                  </div>
                </div>

                {isLow && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5"/>
                    <span>Need {Math.ceil((0.75 * row.total_classes - row.classes_attended) / 0.25)} more classes to reach 75%</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
