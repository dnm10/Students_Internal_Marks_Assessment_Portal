import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Save, Send, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchSectionMarks, saveMarks, submitMarksForApproval,
  selectSectionMarks, selectMarksLoading, selectMarksSaving
} from '../../store/slices/marksSlice'
import { InfoCard } from '../../components/common/Cards'
import { getStatusBadge } from '../../utils/helpers'
import api from '../../utils/api'

const SUBJECTS = [
  { id:1, code:'CS401', name:'DAA',  type:'theory' },
  { id:2, code:'CS402', name:'DBMS', type:'theory' },
  { id:6, code:'CS406L',name:'DBMS Lab', type:'lab' },
]

const FIELDS = [
  { key:'cie1',        label:'CIE 1', max:30,  type:'number' },
  { key:'cie2',        label:'CIE 2', max:30,  type:'number' },
  { key:'cie3',        label:'CIE 3', max:30,  type:'number' },
  { key:'assignment1', label:'A1',    max:10,  type:'number' },
  { key:'assignment2', label:'A2',    max:10,  type:'number' },
]

function ScoreInput({ value, max, onChange, disabled }) {
  const numVal = parseFloat(value)
  const isOver = !isNaN(numVal) && numVal > max
  return (
    <input
      type="number" min="0" max={max} step="0.5"
      value={value ?? ''} onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`w-16 px-1.5 py-1 text-center text-sm rounded-lg border transition-colors
        bg-dark-800/60 text-slate-200 focus:outline-none focus:ring-1
        ${isOver ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500'}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    />
  )
}

export default function MarksEntry() {
  const dispatch   = useDispatch()
  const marks      = useSelector(selectSectionMarks)
  const isLoading  = useSelector(selectMarksLoading)
  const isSaving   = useSelector(selectMarksSaving)

  const [filter, setFilter] = useState({ subjectId:'1', sectionId:'1' })
  const [edits,  setEdits]  = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [importing,  setImporting]  = useState(false)

  useEffect(() => {
    dispatch(fetchSectionMarks({ ...filter, academicYear:'2024-2025' }))
    setEdits({})
  }, [dispatch, filter])

  const setEdit = (studentId, field, value) => {
    setEdits(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }))
  }

  const getVal = (row, field) => edits[row.student_id]?.[field] ?? row[field]

  const handleSave = async () => {
    const changed = Object.entries(edits)
    if (!changed.length) { toast('No changes to save'); return }

    let saved = 0
    for (const [studentId, vals] of changed) {
      const res = await dispatch(saveMarks({
        studentId: parseInt(studentId),
        subjectId: parseInt(filter.subjectId),
        sectionId: parseInt(filter.sectionId),
        semesterId: 4,
        academicYear: '2024-2025',
        ...vals,
      }))
      if (!res.error) saved++
    }
    if (saved) { toast.success(`Saved ${saved} records`); setEdits({}); dispatch(fetchSectionMarks({ ...filter, academicYear:'2024-2025' })) }
  }

  const handleSubmit = async () => {
    if (Object.keys(edits).length > 0) {
      toast.error('Please save all changes before submitting')
      return
    }
    setSubmitting(true)
    const res = await dispatch(submitMarksForApproval({
      subjectId: parseInt(filter.subjectId),
      sectionId: parseInt(filter.sectionId),
      academicYear: '2024-2025',
    }))
    if (!res.error) {
      toast.success('Marks submitted for HOD approval!')
      dispatch(fetchSectionMarks({ ...filter, academicYear:'2024-2025' }))
    }
    setSubmitting(false)
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const form = new FormData()
    form.append('file', file)
    form.append('subjectId', filter.subjectId)
    form.append('sectionId', filter.sectionId)
    form.append('semesterId', '4')
    try {
      const { data } = await api.post('/marks/bulk-upload', form, { headers: { 'Content-Type':'multipart/form-data' } })
      toast.success(data.message)
      dispatch(fetchSectionMarks({ ...filter, academicYear:'2024-2025' }))
    } catch {} finally { setImporting(false); e.target.value='' }
  }

  const isLocked = marks.some(m => m.status === 'locked')

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Marks Entry</h1>
          <p className="page-subtitle">Enter CIE, assignment and lab marks for students</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={`btn-secondary flex items-center gap-2 cursor-pointer text-sm ${importing?'opacity-50':''}`}>
            <Upload className="w-4 h-4"/> {importing?'Uploading…':'Bulk Upload'}
            <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleBulkUpload} />
          </label>
          {Object.keys(edits).length > 0 && (
            <button onClick={handleSave} disabled={isSaving} className="btn-secondary flex items-center gap-2 text-sm">
              <Save className="w-4 h-4"/> {isSaving?'Saving…':'Save Changes'}
            </button>
          )}
          <button onClick={handleSubmit} disabled={submitting || isLocked} className="btn-primary flex items-center gap-2 text-sm">
            <Send className="w-4 h-4"/> {submitting?'Submitting…':isLocked?'Locked':'Submit for Approval'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filter.subjectId} onChange={e=>setFilter(p=>({...p,subjectId:e.target.value}))} className="input-field w-56 text-sm">
          {SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
        </select>
        <select value={filter.sectionId} onChange={e=>setFilter(p=>({...p,sectionId:e.target.value}))} className="input-field w-36 text-sm">
          <option value="1">Section A</option>
          <option value="2">Section B</option>
        </select>
      </div>

      {isLocked && (
        <div className="glass border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm flex items-center gap-2">
          ⚠️ Marks for this subject are locked. Contact admin to unlock.
        </div>
      )}

      <div className="table-container">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-dark-800/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">USN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
              {FIELDS.map(f=>(
                <th key={f.key} className="px-2 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {f.label}<span className="text-slate-600 normal-case">/{f.max}</span>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({length:5}).map((_,i)=>(
                <tr key={i} className="border-b border-white/5">
                  {Array.from({length:FIELDS.length+4}).map((_,j)=>(
                    <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full rounded"/></td>
                  ))}
                </tr>
              ))
              : marks.map(row=>{
                const locked = row.status==='locked'||isLocked
                const changed = !!edits[row.student_id]
                const status = getStatusBadge(row.status)
                return (
                  <tr key={row.student_id} className={`border-b border-white/5 transition-colors ${changed?'bg-primary-900/10':''} hover:bg-white/[0.02]`}>
                    <td className="px-4 py-2.5"><code className="text-accent-400 text-xs font-mono">{row.usn}</code></td>
                    <td className="px-4 py-2.5 font-medium text-white whitespace-nowrap">{row.first_name} {row.last_name}</td>
                    {FIELDS.map(f=>(
                      <td key={f.key} className="px-2 py-2.5 text-center">
                        <ScoreInput
                          value={getVal(row,f.key)}
                          max={f.max}
                          onChange={v=>setEdit(row.student_id, f.key, v===''?null:parseFloat(v))}
                          disabled={locked}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center font-bold text-white">{row.total??'—'}</td>
                    <td className="px-4 py-2.5 text-center"><span className={status.cls}>{status.label}</span></td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
