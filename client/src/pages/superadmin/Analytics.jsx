import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { InfoCard } from '../../components/common/Cards'

const subjectPerf = [
  { subject: 'DAA',   avg: 74 },
  { subject: 'DBMS',  avg: 81 },
  { subject: 'CN',    avg: 68 },
  { subject: 'OS',    avg: 77 },
  { subject: 'SE',    avg: 72 },
  { subject: 'Java',  avg: 85 },
]

const semTrend = [
  { sem: 'Sem 1', avg: 70 },
  { sem: 'Sem 2', avg: 73 },
  { sem: 'Sem 3', avg: 68 },
  { sem: 'Sem 4', avg: 79 },
]

const radarData = [
  { subject: 'CIE',         A: 75 },
  { subject: 'Assignments', A: 82 },
  { subject: 'Lab',         A: 78 },
  { subject: 'Attendance',  A: 88 },
]

export default function SuperAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">System Analytics</h1>
        <p className="page-subtitle">Deep insights across all departments and semesters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard title="Subject Performance" subtitle="Average marks per subject">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectPerf} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px' }} />
              <Bar dataKey="avg" fill="#6366f1" radius={[6,6,0,0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>

        <InfoCard title="Semester Trend" subtitle="Average performance over semesters">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={semTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sem" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="avg" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 5 }} name="Avg Score" />
            </LineChart>
          </ResponsiveContainer>
        </InfoCard>

        <InfoCard title="Performance Radar" subtitle="Component-wise breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar name="Avg" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </InfoCard>

        <InfoCard title="Key Insights" subtitle="System-level observations">
          <div className="space-y-3 p-1">
            {[
              { label: 'Java Programming has highest avg (85)',    color: 'text-emerald-400' },
              { label: 'Computer Networks needs improvement (68)', color: 'text-amber-400'   },
              { label: '12 students below 75% attendance',         color: 'text-red-400'     },
              { label: '20 marks records pending approval',         color: 'text-blue-400'    },
              { label: 'Semester 4 is best performing so far',      color: 'text-primary-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 glass p-3 rounded-xl">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color.replace('text-', 'bg-')}`} />
                <p className={`text-sm ${item.color}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  )
}
