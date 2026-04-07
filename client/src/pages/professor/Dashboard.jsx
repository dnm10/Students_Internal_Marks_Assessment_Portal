import { useEffect, useState } from 'react'
import { ClipboardList, CalendarCheck, BookOpen, Users } from 'lucide-react'
import { StatsCard, InfoCard } from '../../components/common/Cards'
import api from '../../utils/api'

const activityFeed = [
  { text:'Marks submitted for CS401 — Section A', time:'1 hr ago',   type:'marks'  },
  { text:'Attendance marked for CS402 — 22/25 present', time:'3 hrs ago', type:'att' },
  { text:'CIE 2 marks approved by HOD', time:'Yesterday', type:'approved' },
]

export default function ProfDashboard() {
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    // Fetch assigned subjects
    api.get('/users/me').catch(() => {})
  }, [])

  const cards = [
    { title:'Subjects Assigned', value:'5', icon:BookOpen,      color:'primary' },
    { title:'Students',          value:'25',icon:Users,         color:'cyan'    },
    { title:'Marks Submitted',   value:'3', icon:ClipboardList, color:'emerald' },
    { title:'Attendance Sessions', value:'12', icon:CalendarCheck, color:'amber' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Professor Dashboard</h1>
        <p className="page-subtitle">Your teaching assignments and academic activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c,i) => <StatsCard key={c.title} {...c} delay={i}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard title="Quick Actions" subtitle="Common tasks">
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { label:'Enter Marks',    href:'/professor/marks',      color:'bg-primary-500/20 text-primary-400'  },
              { label:'Mark Attendance',href:'/professor/attendance', color:'bg-emerald-500/20 text-emerald-400'  },
              { label:'My Subjects',   href:'/professor/subjects',    color:'bg-cyan-500/20    text-cyan-400'      },
              { label:'View Analytics',href:'/professor/analytics',  color:'bg-amber-500/20   text-amber-400'     },
            ].map(a => (
              <a key={a.label} href={a.href} className={`p-4 rounded-xl ${a.color} flex items-center justify-center text-sm font-medium transition-all hover:opacity-80`}>
                {a.label}
              </a>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Recent Activity" subtitle="Your latest actions">
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  item.type==='marks'?'bg-primary-500':item.type==='att'?'bg-emerald-500':'bg-amber-500'
                }`} />
                <div>
                  <p className="text-xs text-slate-300">{item.text}</p>
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
