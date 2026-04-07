import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { InfoCard } from '../../components/common/Cards'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const reportTypes = [
  { label: 'Marks Report (Excel)',      icon: FileSpreadsheet, color: 'text-emerald-400', desc: 'All approved marks for a section/subject',    action: 'marks_excel'   },
  { label: 'Attendance Report (Excel)', icon: FileSpreadsheet, color: 'text-cyan-400',    desc: 'Attendance summary with shortage alerts',       action: 'att_excel'     },
  { label: 'Student Marksheet (PDF)',   icon: FileText,        color: 'text-primary-400', desc: 'Individual student CIE marksheet PDF',          action: 'marksheet_pdf' },
]

export default function AdminReports() {
  const handleDownload = async (action) => {
    toast('Report generation started…', { icon: '⏳' })
    try {
      if (action === 'marks_excel') {
        const resp = await api.get('/reports/marks/excel', {
          params: { subjectId:1, sectionId:1, academicYear:'2024-2025' },
          responseType: 'blob'
        })
        const url = URL.createObjectURL(resp.data)
        Object.assign(document.createElement('a'), { href:url, download:'marks.xlsx' }).click()
        URL.revokeObjectURL(url)
      } else if (action === 'att_excel') {
        const resp = await api.get('/reports/attendance/excel', {
          params: { subjectId:1, sectionId:1, academicYear:'2024-2025' },
          responseType: 'blob'
        })
        const url = URL.createObjectURL(resp.data)
        Object.assign(document.createElement('a'), { href:url, download:'attendance.xlsx' }).click()
        URL.revokeObjectURL(url)
      } else if (action === 'marksheet_pdf') {
        // Use first student for demo
        const resp = await api.get('/reports/marksheet/8', { responseType:'blob' })
        const url = URL.createObjectURL(resp.data)
        Object.assign(document.createElement('a'), { href:url, download:'marksheet.pdf' }).click()
        URL.revokeObjectURL(url)
      }
      toast.success('Report downloaded!')
    } catch { toast.error('Failed to generate report') }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and download academic reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportTypes.map((r) => (
          <div key={r.action} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
                <r.icon className={`w-5 h-5 ${r.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{r.label}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(r.action)}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4"/> Download
            </button>
          </div>
        ))}
      </div>

      <InfoCard title="Quick Stats" subtitle="Current academic period">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { label:'Total Reports Generated', value:'347' },
            { label:'PDFs Downloaded',         value:'128' },
            { label:'Excel Exports',           value:'219' },
            { label:'Last Generated',          value:'2 hrs ago' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  )
}
