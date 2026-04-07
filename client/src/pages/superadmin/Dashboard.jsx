import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, GraduationCap, BookOpen, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { fetchSystemStats, selectSystemStats } from '../../store/slices/usersSlice'
import { StatsCard, SkeletonCard, InfoCard } from '../../components/common/Cards'

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const monthlyData = [
  { month: 'Aug', students: 120, marks: 85 },
  { month: 'Sep', students: 122, marks: 78 },
  { month: 'Oct', students: 118, marks: 91 },
  { month: 'Nov', students: 121, marks: 88 },
  { month: 'Dec', students: 115, marks: 72 },
  { month: 'Jan', students: 123, marks: 94 },
]

const marksDistribution = [
  { name: 'Approved', value: 65 },
  { name: 'Pending',  value: 20 },
  { name: 'Draft',    value: 10 },
  { name: 'Locked',   value: 5  },
]

const departmentPerf = [
  { dept: 'CSE', avg: 78 },
  { dept: 'ECE', avg: 72 },
  { dept: 'ME',  avg: 68 },
]

export default function SuperAdminDashboard() {
  const dispatch = useDispatch()
  const stats    = useSelector(selectSystemStats)

  useEffect(() => { dispatch(fetchSystemStats()) }, [dispatch])

  const statsCards = [
    { title: 'Total Users',     value: stats?.total_users      ?? '—', icon: Users,          color: 'primary', subtitle: 'All active accounts' },
    { title: 'Students',        value: stats?.total_students   ?? '—', icon: GraduationCap,  color: 'cyan',    subtitle: 'Enrolled students' },
    { title: 'Professors',      value: stats?.total_professors ?? '—', icon: BookOpen,       color: 'emerald', subtitle: 'Active faculty' },
    { title: 'Departments',     value: stats?.total_departments?? '—', icon: TrendingUp,     color: 'violet',  subtitle: 'Academic departments' },
    { title: 'Marks Approved',  value: stats?.marks_approved  ?? '—', icon: CheckCircle,    color: 'emerald', subtitle: 'Fully approved records' },
    { title: 'Marks Pending',   value: stats?.marks_pending   ?? '—', icon: Clock,          color: 'amber',   subtitle: 'Awaiting approval' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">System Overview</h1>
        <p className="page-subtitle">Complete portal analytics and management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {!stats
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statsCards.map((s, i) => <StatsCard key={s.title} {...s} delay={i} />)
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly activity */}
        <InfoCard title="Monthly Activity" subtitle="Student attendance & marks trends" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMarks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="students" stroke="#6366f1" fill="url(#gradStudents)" strokeWidth={2} name="Students" />
              <Area type="monotone" dataKey="marks"    stroke="#06b6d4" fill="url(#gradMarks)"    strokeWidth={2} name="Avg Marks" />
            </AreaChart>
          </ResponsiveContainer>
        </InfoCard>

        {/* Marks distribution pie */}
        <InfoCard title="Marks Status" subtitle="Distribution across all records">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={marksDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {marksDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </InfoCard>
      </div>

      {/* Department performance */}
      <InfoCard title="Department Performance" subtitle="Average marks by department">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={departmentPerf} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="dept" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px' }} />
            <Bar dataKey="avg" fill="#6366f1" radius={[6,6,0,0]} name="Avg Score" />
          </BarChart>
        </ResponsiveContainer>
      </InfoCard>
    </div>
  )
}
