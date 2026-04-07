import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, Clock, AlertTriangle, BookOpen } from 'lucide-react'
import { StatsCard, InfoCard } from '../../components/common/Cards'
import api from '../../utils/api'

export default function HodDashboard() {
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    api.get('/reports/analytics', { params: { academicYear:'2024-2025' } })
      .then(({ data }) => setAnalytics(data.data))
      .catch(() => {})
  }, [])

  const subjectStats = analytics?.subjectStats || []
  const below75 = analytics?.attendanceStats?.reduce((a,s) => a + parseInt(s.below75_count||0), 0) || 0

  const cards = [
    { title:'Subjects Assigned', value: subjectStats.length || 10,  icon: BookOpen,       color:'primary' },
    { title:'Marks Approved',    value: subjectStats.reduce((a,s) => a + parseInt(s.approved_count||0), 0) || 0,  icon: CheckCircle,   color:'emerald' },
    { title:'Pending Approval',  value: subjectStats.reduce((a,s) => a + parseInt(s.pending_count||0), 0) || 0,   icon: Clock,         color:'amber'   },
    { title:'Low Attendance',    value: below75,                     icon: AlertTriangle,  color:'red'     },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">HOD Dashboard</h1>
        <p className="page-subtitle">Department overview — Computer Science & Engineering</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c,i) => <StatsCard key={c.title} {...c} delay={i}/>)}
      </div>

      <InfoCard title="Subject-wise Marks" subtitle="Average marks per subject">
        {subjectStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectStats} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject_code" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'12px' }} />
              <Bar dataKey="avg_total" fill="#6366f1" radius={[6,6,0,0]} name="Avg Total" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
            Loading analytics…
          </div>
        )}
      </InfoCard>
    </div>
  )
}
