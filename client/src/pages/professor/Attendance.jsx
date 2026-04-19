import { useState, useEffect } from 'react'
import { CalendarCheck, Save, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { InfoCard } from '../../components/common/Cards'
import api from '../../utils/api'

const SUBJECTS = [
  { id:1, code:'CS401', name:'DAA'       },
  { id:2, code:'CS402', name:'DBMS'      },
  { id:3, code:'CS403', name:'Networks'  },
]

const STATUS_OPTS = ['present','absent','late','excused']
const STATUS_STYLES = {
  present: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  absent:  'bg-red-500/20    text-red-300    border-red-500/30',
  late:    'bg-amber-500/20  text-amber-300  border-amber-500/30',
  excused: 'bg-blue-500/20   text-blue-300   border-blue-500/30',
}

export default function AttendanceMark() {
  const [filter, setFilter] = useState({ subjectId:'1', sectionId:'1', date: new Date().toISOString().slice(0,10) })
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    setLoading(true)
    setErrorMsg('')
    // Fetch students in this section
    api.get('/users', { params: { role:'student' } })
      .then(({ data }) => {
        setStudents(data.data.rows || [])
        const init = {}
        ;(data.data.rows||[]).forEach(s => { init[s.id] = 'present' })
        setAttendance(init)
      })
      .catch((err)=>{
         console.error('Fetch students error:', err)
         setErrorMsg(err.response?.data?.message || err.message || 'Failed to load students')
      })
      .finally(()=>setLoading(false))
  }, [filter.sectionId])

  const toggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const markAll = (status) => {
    const next = {}
    students.forEach(s => { next[s.id] = status })
    setAttendance(next)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        subjectId: parseInt(filter.subjectId),
        sectionId: parseInt(filter.sectionId),
        date: filter.date,
        attendance: students.map(s => ({ studentId: s.id, status: attendance[s.id] || 'present' })),
      }
      await api.post('/attendance', payload)
      toast.success(`Attendance marked for ${students.length} students`)
    } catch {} finally { setSaving(false) }
  }

  const absentCount  = Object.values(attendance).filter(v=>v==='absent').length
  const presentCount = Object.values(attendance).filter(v=>v==='present').length

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Mark Attendance</h1>
          <p className="page-subtitle">{presentCount} present · {absentCount} absent of {students.length} students</p>
        </div>
        <button onClick={handleSave} disabled={saving||!students.length} className="btn-primary flex items-center gap-2 text-sm">
          <Save className="w-4 h-4"/> {saving?'Saving…':'Save Attendance'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Subject</label>
          <select value={filter.subjectId} onChange={e=>setFilter(p=>({...p,subjectId:e.target.value}))} className="input-field w-48 text-sm">
            {SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Date</label>
          <input type="date" value={filter.date} max={new Date().toISOString().slice(0,10)}
            onChange={e=>setFilter(p=>({...p,date:e.target.value}))} className="input-field w-40 text-sm" />
        </div>
        <div className="flex gap-2 ml-auto">
          {['present','absent'].map(s=>(
            <button key={s} onClick={()=>markAll(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-colors ${STATUS_STYLES[s]}`}>
              All {s}
            </button>
          ))}
        </div>
      </div>

      {absentCount > 0 && (
        <div className="glass border border-amber-500/30 rounded-xl p-3 flex items-center gap-2 text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
          <span>{absentCount} student{absentCount>1?'s':''} marked absent. Email alerts will be sent for chronic absentees.</span>
        </div>
      )}

      <div className="table-container">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-dark-800/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">USN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-500 text-sm">Loading students…</td></tr>
            ) : errorMsg ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-red-500 text-sm font-semibold">{errorMsg}</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-500 text-sm">No students found.</td></tr>
            ) : students.map(student => (
              <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5"><code className="text-accent-400 text-xs font-mono">{student.usn||'—'}</code></td>
                <td className="px-4 py-2.5 font-medium text-white">{student.first_name} {student.last_name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-1.5">
                    {STATUS_OPTS.map(s=>(
                      <button
                        key={s}
                        onClick={()=>toggle(student.id, s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition-all ${
                          attendance[student.id]===s ? STATUS_STYLES[s] : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
