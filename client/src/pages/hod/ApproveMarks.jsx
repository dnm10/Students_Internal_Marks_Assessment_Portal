import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle, Lock, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchSectionMarks, approveMarks, selectSectionMarks, selectMarksLoading
} from '../../store/slices/marksSlice'
import DataTable from '../../components/common/Table'
import { InfoCard } from '../../components/common/Cards'
import { getStatusBadge, fmtMark } from '../../utils/helpers'
import api from '../../utils/api'

const SUBJECTS = [
  { id:1, code:'CS401', name:'Design and Analysis of Algorithms' },
  { id:2, code:'CS402', name:'Database Management Systems' },
  { id:3, code:'CS403', name:'Computer Networks' },
]

export default function ApproveMarks() {
  const dispatch  = useDispatch()
  const marks     = useSelector(selectSectionMarks)
  const isLoading = useSelector(selectMarksLoading)
  const [filter, setFilter] = useState({ subjectId:'1', sectionId:'1' })
  const [approving, setApproving] = useState(false)
  const [selected, setSelected] = useState([])

  useEffect(() => {
    dispatch(fetchSectionMarks({ ...filter, academicYear:'2024-2025' }))
  }, [dispatch, filter])

  const handleApproveSelected = async () => {
    if (!selected.length) { toast.error('Select at least one student'); return }
    setApproving(true)
    const res = await dispatch(approveMarks({
      subjectId: parseInt(filter.subjectId),
      sectionId: parseInt(filter.sectionId),
      studentIds: selected,
      academicYear:'2024-2025',
    }))
    if (!res.error) {
      toast.success(`${selected.length} marks approved`)
      setSelected([])
      dispatch(fetchSectionMarks({ ...filter, academicYear:'2024-2025' }))
    }
    setApproving(false)
  }

  const handleApproveAll = async () => {
    setApproving(true)
    const res = await dispatch(approveMarks({
      subjectId: parseInt(filter.subjectId),
      sectionId: parseInt(filter.sectionId),
      academicYear:'2024-2025',
    }))
    if (!res.error) {
      toast.success('All submitted marks approved')
      dispatch(fetchSectionMarks({ ...filter, academicYear:'2024-2025' }))
    }
    setApproving(false)
  }

  const submittedMarks = marks.filter(m => m.status === 'submitted')

  const columns = [
    { key:'student_id', header:'', render:(_,row) => (
      <input type="checkbox" checked={selected.includes(row.student_id)}
        onChange={e => setSelected(prev => e.target.checked ? [...prev, row.student_id] : prev.filter(id => id !== row.student_id))}
        className="rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-transparent cursor-pointer"
      />
    )},
    { key:'usn',        header:'USN',   sortable:true, render:(v)=><code className="text-accent-400 text-xs font-mono">{v}</code> },
    { key:'first_name', header:'Student', sortable:true, render:(_,r)=><span className="text-white text-sm font-medium">{r.first_name} {r.last_name}</span> },
    { key:'cie1',       header:'CIE 1',  render:(v)=>fmtMark(v,30) },
    { key:'cie2',       header:'CIE 2',  render:(v)=>fmtMark(v,30) },
    { key:'cie3',       header:'CIE 3',  render:(v)=>fmtMark(v,30) },
    { key:'assignment1',header:'Asgn 1', render:(v)=>fmtMark(v,10) },
    { key:'assignment2',header:'Asgn 2', render:(v)=>fmtMark(v,10) },
    { key:'total',      header:'Total',  sortable:true, render:(v)=><span className="font-semibold text-white">{v??'—'}</span> },
    { key:'status',     header:'Status', render:(v)=>{const b=getStatusBadge(v); return <span className={b.cls}>{b.label}</span>} },
    { key:'submitted_by_name', header:'Submitted By', render:(v)=>v||'—' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Approve Marks</h1>
          <p className="page-subtitle">{submittedMarks.length} marks awaiting your approval</p>
        </div>
        <div className="flex gap-3">
          {selected.length > 0 && (
            <button onClick={handleApproveSelected} disabled={approving}
              className="btn-success flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4"/> Approve Selected ({selected.length})
            </button>
          )}
          <button onClick={handleApproveAll} disabled={approving || !submittedMarks.length}
            className="btn-primary flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4"/> {approving ? 'Approving…' : 'Approve All Submitted'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filter.subjectId} onChange={e=>setFilter(p=>({...p,subjectId:e.target.value}))}
          className="input-field w-auto max-w-xs text-sm">
          {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
        </select>
        <select value={filter.sectionId} onChange={e=>setFilter(p=>({...p,sectionId:e.target.value}))}
          className="input-field w-auto text-sm">
          <option value="1">Section A</option>
          <option value="2">Section B</option>
        </select>
      </div>

      <InfoCard noPad>
        <div className="p-4">
          <DataTable columns={columns} data={marks} isLoading={isLoading} pageSize={20} />
        </div>
      </InfoCard>
    </div>
  )
}
