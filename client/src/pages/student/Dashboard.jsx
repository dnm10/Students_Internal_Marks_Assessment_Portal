import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ClipboardList, CalendarCheck, TrendingUp, Star } from 'lucide-react'
import { fetchMyMarks, selectMyMarks, selectMarksLoading } from '../../store/slices/marksSlice'
import { StatsCard, SkeletonCard, InfoCard } from '../../components/common/Cards'
import { getGrade } from '../../utils/helpers'

export default function StudentDashboard() {
  const dispatch  = useDispatch()
  const marks     = useSelector(selectMyMarks)
  const isLoading = useSelector(selectMarksLoading)

  useEffect(() => { dispatch(fetchMyMarks({ academicYear:'2024-2025', semesterId:4 })) }, [dispatch])

  const approvedMarks  = marks.filter(m => m.status === 'approved' || m.status === 'locked')
  const avgTotal       = approvedMarks.length
    ? (approvedMarks.reduce((a,m) => a + parseFloat(m.total || 0), 0) / approvedMarks.length).toFixed(1)
    : '—'
  const maxPossible    = 105  // rough max with lab
  const overallPct     = avgTotal !== '—' ? Math.round((parseFloat(avgTotal) / maxPossible) * 100) : 0
  const grade          = getGrade(overallPct)

  const radarData = approvedMarks.slice(0, 6).map(m => ({
    subject: m.subject_code,
    marks:   parseFloat(m.total || 0),
  }))

  const barData = approvedMarks.map(m => ({
    subject: m.subject_code,
    total:   parseFloat(m.total || 0),
  }))

  const cards = [
    { title:'Subjects',        value: marks.length,        icon: ClipboardList,  color:'primary' },
    { title:'Overall Average', value: avgTotal,            icon: TrendingUp,     color:'cyan'    },
    { title:'Grade',           value: grade?.grade || '—', icon: Star,           color:'emerald' },
    { title:'Approved',        value: approvedMarks.length,icon: CalendarCheck,  color:'violet'  },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Dashboard</h1>
        <p className="page-subtitle">Your academic performance overview — Semester 4, 2024-2025</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>) : cards.map((c,i)=><StatsCard key={c.title} {...c} delay={i}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard title="Subject-wise Marks" subtitle="Your total marks per subject">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'12px' }} />
              <Bar dataKey="total" fill="#6366f1" radius={[6,6,0,0]} name="Total Marks"/>
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>

        <InfoCard title="Performance Radar" subtitle="Subject-wise score map">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill:'#64748b', fontSize:10 }} />
              <Radar name="Marks" dataKey="marks" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2}/>
            </RadarChart>
          </ResponsiveContainer>
        </InfoCard>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label:'View All Marks',   href:'/student/marks',      icon:'📊', color:'from-primary-500/20 to-primary-600/10' },
          { label:'My Attendance',    href:'/student/attendance',  icon:'📅', color:'from-emerald-500/20 to-emerald-600/10' },
          { label:'Download Marksheet', href:'/student/marksheet', icon:'📄', color:'from-amber-500/20   to-amber-600/10'   },
        ].map(item => (
          <motion.a key={item.label} href={item.href}
            whileHover={{ scale:1.02 }}
            className={`glass-card p-5 flex items-center gap-4 bg-gradient-to-br ${item.color} cursor-pointer`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-semibold text-white">{item.label}</span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
