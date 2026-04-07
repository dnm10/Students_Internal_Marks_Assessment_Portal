import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyMarks, selectMyMarks, selectMarksLoading } from '../../store/slices/marksSlice'
import { InfoCard, SkeletonCard } from '../../components/common/Cards'
import { fmtMark, getStatusBadge, getGrade } from '../../utils/helpers'
import { clsx } from 'clsx'

function MarksRow({ mark }) {
  const status  = getStatusBadge(mark.status)
  const maxTotal = mark.max_cie1 + mark.max_cie2 + mark.max_cie3 + mark.max_assignment1 + mark.max_assignment2
    + (mark.subject_type !== 'theory' ? mark.max_lab_internal : 0) + mark.max_attendance_marks
  const pct    = mark.total ? Math.round((parseFloat(mark.total) / maxTotal) * 100) : 0
  const grade  = getGrade(pct)

  return (
    <div className="glass rounded-xl p-4 space-y-3 hover:border-primary-500/20 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <code className="text-xs text-accent-400 font-mono">{mark.subject_code}</code>
            <span className="text-xs text-slate-500">{mark.credits} cr</span>
            <span className={clsx('badge', mark.subject_type==='lab'?'badge-cyan':mark.subject_type==='theory_lab'?'badge-violet':'badge-primary')}>
              {mark.subject_type}
            </span>
          </div>
          <h3 className="font-semibold text-white text-sm">{mark.subject_name}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{mark.total ?? '—'}</p>
          <p className="text-xs text-slate-500">/{maxTotal}</p>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {[
          { label:'CIE 1', val:mark.cie1, max:mark.max_cie1 },
          { label:'CIE 2', val:mark.cie2, max:mark.max_cie2 },
          { label:'CIE 3', val:mark.cie3, max:mark.max_cie3 },
          { label:'Asgn 1', val:mark.assignment1, max:mark.max_assignment1 },
          { label:'Asgn 2', val:mark.assignment2, max:mark.max_assignment2 },
          { label:'Att.',  val:mark.attendance_marks, max:mark.max_attendance_marks },
        ].map(f => (
          <div key={f.label} className="bg-dark-800/60 rounded-lg p-2">
            <p className="text-lg font-bold text-white">{f.val ?? '—'}</p>
            <p className="text-[10px] text-slate-500">/{f.max} {f.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {mark.total !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={grade?.color}>{pct}% — {grade?.label}</span>
            <span className={status.cls}>{status.label}</span>
          </div>
          <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${
              pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`} style={{ width:`${pct}%` }}/>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyMarks() {
  const dispatch  = useDispatch()
  const marks     = useSelector(selectMyMarks)
  const isLoading = useSelector(selectMarksLoading)

  useEffect(() => { dispatch(fetchMyMarks({ academicYear:'2024-2025', semesterId:4 })) }, [dispatch])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Marks</h1>
        <p className="page-subtitle">Internal assessment scores — Semester 4, Academic Year 2024-2025</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>)}
        </div>
      ) : marks.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-slate-500">
          No marks available yet for this semester.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {marks.map(mark => <MarksRow key={mark.id || mark.subject_code} mark={mark} />)}
        </div>
      )}
    </div>
  )
}
