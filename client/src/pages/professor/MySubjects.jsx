import { BookOpen, Users, Calendar } from 'lucide-react'
import { InfoCard } from '../../components/common/Cards'

const mySubjects = [
  { id:1, code:'CS401', name:'Design and Analysis of Algorithms', type:'theory', credits:4, section:'A', students:25, cie1Done:true, cie2Done:true, cie3Done:false },
  { id:2, code:'CS402', name:'Database Management Systems',       type:'theory', credits:4, section:'A', students:25, cie1Done:true, cie2Done:false, cie3Done:false },
  { id:6, code:'CS406L',name:'DBMS Lab',                          type:'lab',    credits:1, section:'A', students:25, cie1Done:false, cie2Done:false, cie3Done:false },
]

const typeColors = { theory:'badge-primary', lab:'badge-cyan', theory_lab:'badge-violet' }

export default function MySubjects() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Subjects</h1>
        <p className="page-subtitle">Subjects assigned to you for Academic Year 2024-2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mySubjects.map(sub => (
          <div key={sub.id} className="glass-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-400"/>
              </div>
              <span className={typeColors[sub.type] || 'badge-gray'}>{sub.type}</span>
            </div>

            <div>
              <code className="text-xs text-accent-400 font-mono">{sub.code}</code>
              <h3 className="font-semibold text-white text-sm mt-1 leading-tight">{sub.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Section {sub.section} · {sub.credits} Credits</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5"/>
                <span>{sub.students} students</span>
              </div>
            </div>

            {/* CIE progress */}
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 font-medium">CIE Marks Status</p>
              <div className="flex gap-2">
                {[
                  { label:'CIE 1', done:sub.cie1Done },
                  { label:'CIE 2', done:sub.cie2Done },
                  { label:'CIE 3', done:sub.cie3Done },
                ].map(c=>(
                  <span key={c.label} className={`text-xs px-2 py-0.5 rounded-md font-medium ${c.done?'bg-emerald-500/20 text-emerald-400':'bg-dark-800 text-slate-500'}`}>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <a href="/professor/marks" className="btn-primary text-xs flex-1 text-center py-2">Enter Marks</a>
              <a href="/professor/attendance" className="btn-secondary text-xs flex-1 text-center py-2">Attendance</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
