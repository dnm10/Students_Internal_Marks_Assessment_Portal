import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { InfoCard } from '../../components/common/Cards'

const deptSubjects = [
  { subject: 'DAA', avg: 72 },
  { subject: 'DBMS', avg: 79 },
  { subject: 'CN', avg: 65 },
  { subject: 'OS', avg: 75 },
]

const sectionTrend = [
  { section: 'A', avg: 78 },
  { section: 'B', avg: 71 },
  { section: 'C', avg: 69 },
]

const attendanceData = [
  { category: 'Above 85%', value: 40 },
  { category: '75-85%', value: 25 },
  { category: 'Below 75%', value: 15 },
]

export default function HodAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Department Analytics</h1>
        <p className="page-subtitle">Insights for your department performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Subject Performance */}
        <InfoCard title="Subject Performance" subtitle="Avg marks in your department">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptSubjects}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis domain={[0,100]} tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(99,102,241,0.3)' }} />
              <Bar dataKey="avg" fill="#6366f1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>

        {/* Section Trend */}
        <InfoCard title="Section Performance" subtitle="Avg marks by section">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sectionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="section" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis domain={[60,100]} tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)' }} />
              <Line type="monotone" dataKey="avg" stroke="#06b6d4" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </InfoCard>

        {/* Attendance Distribution */}
        <InfoCard title="Attendance Overview" subtitle="Student attendance distribution">
          <div className="space-y-3 p-1">
            {attendanceData.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-slate-300">
                <span>{item.category}</span>
                <span>{item.value} students</span>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Insights */}
        <InfoCard title="Key Insights" subtitle="Department highlights">
          <div className="space-y-3 p-1">
            {[
              { label: 'DBMS performing best (79 avg)', color: 'text-emerald-400' },
              { label: 'CN needs attention (65 avg)', color: 'text-amber-400' },
              { label: '15 students below 75% attendance', color: 'text-red-400' },
              { label: 'Section A performing highest', color: 'text-blue-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 glass p-3 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                <p className={`text-sm ${item.color}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </InfoCard>

      </div>
    </div>
  )
}