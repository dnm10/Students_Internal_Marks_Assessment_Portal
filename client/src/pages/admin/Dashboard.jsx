import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, GraduationCap, BookOpen, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { fetchSystemStats, selectSystemStats } from '../../store/slices/usersSlice'
import { StatsCard, SkeletonCard, InfoCard } from '../../components/common/Cards'

const activityFeed = [
  { time: '2 min ago',   text: 'Prof. Ramesh submitted CS401 marks for Section A',   type: 'marks'    },
  { time: '15 min ago',  text: 'Bulk import: 22 students added to CSE Sem 4 Sec B',  type: 'import'   },
  { time: '1 hr ago',    text: 'HOD approved DBMS marks for Section A',               type: 'approved' },
  { time: '3 hrs ago',   text: '5 students flagged for low attendance in CS403',      type: 'alert'    },
  { time: 'Yesterday',   text: 'Academic calendar updated — CIE 3 schedule added',   type: 'system'   },
]

const typeColor = { marks: 'bg-primary-500', import: 'bg-cyan-500', approved: 'bg-emerald-500', alert: 'bg-amber-500', system: 'bg-violet-500' }

const subjectAvg = [
  { sub: 'DAA',  avg: 74 }, { sub: 'DBMS', avg: 81 }, { sub: 'CN',  avg: 68 },
  { sub: 'OS',   avg: 77 }, { sub: 'SE',   avg: 72 }, { sub: 'Java', avg: 85 },
]

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const stats    = useSelector(selectSystemStats)

  useEffect(() => { dispatch(fetchSystemStats()) }, [dispatch])

  const cards = [
    { title: 'Total Students', value: stats?.total_students ?? '—',    icon: GraduationCap, color: 'primary' },
    { title: 'Professors',     value: stats?.total_professors ?? '—',  icon: BookOpen,      color: 'cyan'    },
    { title: 'Marks Approved', value: stats?.marks_approved ?? '—',   icon: CheckCircle,   color: 'emerald' },
    { title: 'Marks Pending',  value: stats?.marks_pending ?? '—',    icon: Clock,         color: 'amber'   },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">College administration overview — Academic Year 2024-2025</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {!stats ? Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>) : cards.map((c,i)=><StatsCard key={c.title} {...c} delay={i}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InfoCard title="Subject Performance" subtitle="Avg marks across all sections" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectAvg} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sub" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis domain={[0,100]} tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'12px' }} />
              <Bar dataKey="avg" fill="#6366f1" radius={[6,6,0,0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>

        <InfoCard title="Recent Activity" subtitle="Live feed of portal events">
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeColor[item.type] || 'bg-slate-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  )
}
