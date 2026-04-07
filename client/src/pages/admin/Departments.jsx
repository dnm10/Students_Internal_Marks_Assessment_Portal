import { useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { InfoCard } from '../../components/common/Cards'
import DataTable from '../../components/common/Table'
import toast from 'react-hot-toast'

const mockDepts = [
  { id:1, name:'Computer Science & Engineering', code:'CSE', branches:2, students:120, is_active:true },
  { id:2, name:'Electronics & Communication',   code:'ECE', branches:1, students:80,  is_active:true },
  { id:3, name:'Mechanical Engineering',         code:'ME',  branches:1, students:60,  is_active:true },
]

export default function AdminDepartments() {
  const [depts, setDepts] = useState(mockDepts)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', code:'', description:'' })
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setDepts(prev => [...prev, { id: Date.now(), ...form, branches:0, students:0, is_active:true }])
    toast.success('Department added successfully')
    setShowForm(false)
    setForm({ name:'', code:'', description:'' })
    setSaving(false)
  }

  const columns = [
    { key:'name', header:'Department Name', sortable:true, render:(v)=>(
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-primary-400"/>
        </div>
        <span className="font-medium text-white text-sm">{v}</span>
      </div>
    )},
    { key:'code',      header:'Code',     sortable:true, render:(v)=><code className="px-2 py-0.5 rounded bg-dark-800 text-accent-400 text-xs font-mono">{v}</code> },
    { key:'branches',  header:'Branches', sortable:true },
    { key:'students',  header:'Students', sortable:true },
    { key:'is_active', header:'Status',   render:(v)=>v?<span className="badge-success">Active</span>:<span className="badge-danger">Inactive</span> },
    { key:'id', header:'Actions', render:()=>(
      <div className="flex gap-2">
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Manage academic departments and branches</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4"/> Add Department
        </button>
      </div>

      {showForm && (
        <InfoCard title="Add New Department">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Department Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="input-field" required />
            <input placeholder="Code (e.g. CSE)" value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value.toUpperCase()}))} className="input-field" required />
            <input placeholder="Description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="input-field" />
            <div className="md:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving?'Saving…':'Add Department'}</button>
            </div>
          </form>
        </InfoCard>
      )}

      <InfoCard noPad>
        <div className="p-4">
          <DataTable columns={columns} data={depts} pageSize={10} />
        </div>
      </InfoCard>
    </div>
  )
}
