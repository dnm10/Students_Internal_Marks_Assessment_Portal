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

      <InfoCard title="Attendance Insight" subtitle="Summary of attendance anomalies">
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          {below75 > 0 
             ? `There are ${below75} students with low attendance across all subjects.` 
             : 'Attendance is generally good.'}
        </div>
      </InfoCard>
    </div>
  )
}
