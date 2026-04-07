import { useState } from 'react'
import { InfoCard } from '../../components/common/Cards'
import { Plus } from 'lucide-react'

const initialDepartments = [
  { id: 1, name: 'Computer Science', hod: 'Dr. Ravi Kumar', students: 120 },
  { id: 2, name: 'Electronics', hod: 'Dr. Priya Sharma', students: 90 },
]

export default function Departments() {
  const [departments, setDepartments] = useState(initialDepartments)
  const [newDept, setNewDept] = useState('')

  const addDepartment = () => {
    if (!newDept) return
    setDepartments([
      ...departments,
      { id: Date.now(), name: newDept, hod: 'Not Assigned', students: 0 }
    ])
    setNewDept('')
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Departments</h1>
        <p className="page-subtitle">Manage all departments in the system</p>
      </div>

      {/* Add Department */}
      <InfoCard title="Add Department">
        <div className="flex gap-2">
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="Department name"
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
          />
          <button onClick={addDepartment} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Add
          </button>
        </div>
      </InfoCard>

      {/* Department List */}
      <InfoCard title="All Departments">
        <div className="space-y-3">
          {departments.map((dept) => (
            <div key={dept.id} className="glass p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{dept.name}</p>
                <p className="text-xs text-slate-400">
                  HOD: {dept.hod} • Students: {dept.students}
                </p>
              </div>
              <button className="text-red-400 text-sm">Delete</button>
            </div>
          ))}
        </div>
      </InfoCard>

    </div>
  )
}