import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Upload, Plus, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchUsers, selectUsers, selectUsersLoading } from '../../store/slices/usersSlice'
import DataTable from '../../components/common/Table'
import { InfoCard } from '../../components/common/Cards'
import { formatDate, getInitials } from '../../utils/helpers'
import api from '../../utils/api'

export default function AdminStudents() {
  const dispatch  = useDispatch()
  const students  = useSelector(selectUsers)
  const isLoading = useSelector(selectUsersLoading)
  const [importing, setImporting] = useState(false)

  useEffect(() => { dispatch(fetchUsers({ role: 'student' })) }, [dispatch])

  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/users/bulk-import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(data.message)
      dispatch(fetchUsers({ role:'student' }))
    } catch {} finally { setImporting(false); e.target.value='' }
  }

  const handleExport = () => {
    import('xlsx').then(({ utils, writeFile }) => {
      const ws = utils.json_to_sheet(students.map(s => ({
        USN: s.usn, Name: `${s.first_name} ${s.last_name}`,
        Email: s.email, Branch: s.branch_name, Semester: s.current_semester,
        Status: s.is_active ? 'Active' : 'Inactive',
      })))
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Students')
      writeFile(wb, 'students_export.xlsx')
    })
  }

  const columns = [
    { key:'usn', header:'USN', sortable:true, render:(v)=><code className="text-accent-400 text-xs font-mono">{v||'—'}</code> },
    { key:'first_name', header:'Student Name', sortable:true, render:(_,row)=>(
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
          {getInitials(row.first_name, row.last_name)}
        </div>
        <div>
          <p className="font-medium text-white text-sm">{row.first_name} {row.last_name}</p>
          <p className="text-[11px] text-slate-500">{row.email}</p>
        </div>
      </div>
    )},
    { key:'branch_name',      header:'Branch',   sortable:true },
    { key:'current_semester', header:'Sem',       sortable:true, render:(v)=>`Sem ${v}` },
    { key:'section_name',     header:'Section',   render:(v)=>v||'—' },
    { key:'is_active', header:'Status', render:(v)=>v?<span className="badge-success">Active</span>:<span className="badge-danger">Inactive</span> },
    { key:'id', header:'Actions', render:(_,row)=>(
      <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View</button>
    )},
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} students enrolled</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4"/> Export
          </button>
          <label className={`btn-secondary flex items-center gap-2 cursor-pointer text-sm ${importing?'opacity-50':''}`}>
            <Upload className="w-4 h-4"/> {importing?'Importing…':'Import CSV'}
            <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleBulkImport} />
          </label>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4"/> Add Student
          </button>
        </div>
      </div>

      <InfoCard noPad>
        <div className="p-4">
          <DataTable columns={columns} data={students} isLoading={isLoading} pageSize={15} />
        </div>
      </InfoCard>
    </div>
  )
}
