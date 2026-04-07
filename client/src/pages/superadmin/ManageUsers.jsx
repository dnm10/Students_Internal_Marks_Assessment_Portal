import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Plus, Upload, Download, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchUsers, deleteUser, selectUsers, selectUsersLoading, selectUsersTotal } from '../../store/slices/usersSlice'
import DataTable  from '../../components/common/Table'
import { InfoCard } from '../../components/common/Cards'
import { getStatusBadge, formatDate, getInitials } from '../../utils/helpers'
import CreateUserModal from '../../components/common/Modal'
import api from '../../utils/api'

export default function ManageUsers() {
  const dispatch = useDispatch()
  const users    = useSelector(selectUsers)
  const isLoading = useSelector(selectUsersLoading)
  const total    = useSelector(selectUsersTotal)

  const [roleFilter, setRoleFilter] = useState('')
  const [importing,  setImporting]  = useState(false)

  useEffect(() => {
    dispatch(fetchUsers({ role: roleFilter || undefined }))
  }, [dispatch, roleFilter])

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return
    const res = await dispatch(deleteUser(id))
    if (!res.error) toast.success('User deactivated')
  }

  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/users/bulk-import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(data.message)
      dispatch(fetchUsers())
    } catch { /* api interceptor shows toast */ } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const columns = [
    {
      key: 'first_name',
      header: 'Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(row.first_name, row.last_name)}
          </div>
          <div>
            <p className="font-medium text-white text-sm">{row.first_name} {row.last_name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role',            header: 'Role',       sortable: true, render: (v) => <span className="badge-primary capitalize">{v}</span> },
    { key: 'department_name', header: 'Department',  sortable: true },
    { key: 'usn',             header: 'USN',         render: (v) => v || '—' },
    { key: 'is_active',       header: 'Status',      render: (v) => v ? <span className="badge-success">Active</span> : <span className="badge-danger">Inactive</span> },
    { key: 'last_login_at',   header: 'Last Login',  sortable: true, render: (v) => formatDate(v) },
    {
      key: 'id',
      header: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2">
          <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Edit</button>
          {row.is_active && (
            <button onClick={() => handleDelete(id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{total} total users in the system</p>
        </div>
        <div className="flex items-center gap-3">
          <label className={`btn-secondary flex items-center gap-2 cursor-pointer text-sm ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            {importing ? 'Importing…' : 'Bulk Import'}
            <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleBulkImport} />
          </label>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Role filter */}
      <div className="flex flex-wrap gap-2">
        {['', 'student', 'professor', 'hod', 'admin', 'superadmin'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              roleFilter === r
                ? 'bg-primary-600 text-white'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
          </button>
        ))}
      </div>

      <InfoCard noPad>
        <div className="p-4">
          <DataTable columns={columns} data={users} isLoading={isLoading} pageSize={12} />
        </div>
      </InfoCard>
    </div>
  )
}
