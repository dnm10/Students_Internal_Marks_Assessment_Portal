import { useState, useEffect } from 'react'
import { InfoCard } from '../../components/common/Cards'
import { Bell, Moon, Sun, Shield, Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const role = user?.role?.toLowerCase()

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  )

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    notifications: true,
  })

  // 🌙 Dark Mode Logic
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Saved:', form)
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* PROFILE */}
      <InfoCard title="Profile" subtitle="Update your personal information">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button className="btn-primary w-full">Save Profile</button>
        </form>
      </InfoCard>

      {/* SECURITY */}
      <InfoCard title="Security" subtitle="Manage your password">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New Password"
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button className="btn-primary w-full">Update Password</button>
        </form>
      </InfoCard>

      {/* PREFERENCES */}
      <InfoCard title="Preferences" subtitle="Customize your experience">
        <div className="space-y-4">

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-300">
              <Bell size={16} />
              Notifications
            </div>
            <input
              type="checkbox"
              name="notifications"
              checked={form.notifications}
              onChange={handleChange}
              className="accent-indigo-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-300">
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              Dark Mode
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="accent-indigo-500"
            />
          </div>

        </div>
      </InfoCard>

      {/* ROLE-BASED SECTION */}
      {(role === 'superadmin' || role === 'admin') && (
        <InfoCard title="System Settings" subtitle="Administrative controls">

          <div className="space-y-4">

            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Enable Mark Approval System</span>
              <input type="checkbox" className="accent-indigo-500" defaultChecked />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Allow Bulk Uploads</span>
              <input type="checkbox" className="accent-indigo-500" defaultChecked />
            </div>

            <div>
              <label className="text-sm text-slate-400">Default Passing Marks</label>
              <input
                type="number"
                defaultValue="40"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
              />
            </div>

          </div>

        </InfoCard>
      )}

      {role === 'hod' && (
        <InfoCard title="Department Settings" subtitle="Department preferences">
          <div className="text-sm text-slate-300 space-y-2">
            <p>• Monitor department performance</p>
            <p>• Manage subject allocation</p>
          </div>
        </InfoCard>
      )}

      {role === 'professor' && (
        <InfoCard title="Teaching Preferences" subtitle="Your teaching settings">
          <div className="text-sm text-slate-300 space-y-2">
            <p>• Default marking scheme</p>
            <p>• Attendance preferences</p>
          </div>
        </InfoCard>
      )}

      {role === 'student' && (
        <InfoCard title="Student Preferences" subtitle="Your preferences">
          <div className="text-sm text-slate-300 space-y-2">
            <p>• View academic progress</p>
            <p>• Manage notifications</p>
          </div>
        </InfoCard>
      )}

    </div>
  )
}