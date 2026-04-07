import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { InfoCard } from '../../components/common/Cards'

const classPerformance = [
  { test: 'CIE 1', avg: 72 },
  { test: 'CIE 2', avg: 78 },
  { test: 'CIE 3', avg: 74 },
]

const subjectStats = [
  { subject: 'DBMS', avg: 80 },
  { subject: 'CN', avg: 68 },
  { subject: 'OS', avg: 76 },
]

const studentDistribution = [
  { range: '90-100', count: 5 },
  { range: '75-89', count: 12 },
  { range: '50-74', count: 10 },
  { range: '<50', count: 3 },
]

export default function ProfessorAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">My Analytics</h1>
        <p className="page-subtitle">Insights from your teaching and student performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Test Performance */}
        <InfoCard title="Test Performance" subtitle="Average marks across tests">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={classPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="test" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis domain={[50,100]} tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)' }} />
              <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </InfoCard>

        {/* Subject Stats */}
        <InfoCard title="Subject Performance" subtitle="Your subject averages">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis domain={[0,100]} tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)' }} />
              <Bar dataKey="avg" fill="#06b6d4" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>

        {/* Marks Distribution */}
        <InfoCard title="Marks Distribution" subtitle="Student performance breakdown">
          <div className="space-y-3 p-1">
            {studentDistribution.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-slate-300">
                <span>{item.range}</span>
                <span>{item.count} students</span>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Insights */}
        <InfoCard title="Insights" subtitle="Key observations">
          <div className="space-y-3 p-1">
            {[
              { label: 'CIE 2 has highest average (78)', color: 'text-emerald-400' },
              { label: 'CN subject needs improvement', color: 'text-amber-400' },
              { label: '3 students below 50 marks', color: 'text-red-400' },
              { label: 'Overall class improving trend', color: 'text-blue-400' },
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