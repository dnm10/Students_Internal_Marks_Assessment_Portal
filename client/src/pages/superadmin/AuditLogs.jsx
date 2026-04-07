import { InfoCard } from '../../components/common/Cards'

const logs = [
  { time: '2 min ago', action: 'Admin created new department', user: 'SuperAdmin' },
  { time: '10 min ago', action: 'Professor submitted marks', user: 'Prof. Ramesh' },
  { time: '1 hr ago', action: 'HOD approved marks', user: 'Dr. Ravi' },
  { time: '3 hrs ago', action: 'New student added', user: 'Admin' },
]

export default function AuditLogs() {
  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Track all system activities</p>
      </div>

      <InfoCard title="System Activity Logs">
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="glass p-4 rounded-xl flex justify-between">
              <div>
                <p className="text-slate-200 text-sm">{log.action}</p>
                <p className="text-xs text-slate-500">By {log.user}</p>
              </div>
              <span className="text-xs text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      </InfoCard>

    </div>
  )
}