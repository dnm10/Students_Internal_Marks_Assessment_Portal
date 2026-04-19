import { Download } from 'lucide-react'
import { InfoCard } from '../../components/common/Cards'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function HodReports() {
  const download = async (type) => {
    toast('Generating report…', { icon:'⏳' })
    try {
      const url = type === 'marks'
        ? '/reports/marks/excel?subjectId=1&sectionId=1&academicYear=2024-2025'
        : '/reports/attendance/excel?subjectId=1&sectionId=1&academicYear=2024-2025'
      const resp = await api.get(url, { responseType:'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(resp.data)
      a.download = type === 'marks' ? 'marks_report.xlsx' : 'attendance_report.xlsx'
      a.click()
      toast.success('Downloaded!')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Department Reports</h1>
        <p className="page-subtitle">Download marks and attendance reports for your department</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title:'Attendance Report (Excel)', desc:'Attendance summary with shortage flags', type:'att', color:'text-cyan-400' },
        ].map(r => (
          <InfoCard key={r.type} title={r.title} subtitle={r.desc}>
            <button onClick={()=>download(r.type)} className="btn-primary w-full flex items-center justify-center gap-2 mt-3 text-sm">
              <Download className="w-4 h-4"/> Download
            </button>
          </InfoCard>
        ))}
      </div>
    </div>
  )
}
