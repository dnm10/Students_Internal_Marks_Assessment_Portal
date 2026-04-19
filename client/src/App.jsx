import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence } from 'framer-motion'

import { fetchMe, selectCurrentUser, selectIsInitialising } from './store/slices/authSlice'

// Layouts
import AuthLayout   from './components/common/AuthLayout'
import DashLayout   from './components/common/DashLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Settings from './components/common/Settings'

// Auth pages
import Login          from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// SuperAdmin pages
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import ManageUsers         from './pages/superadmin/ManageUsers'
import SuperAnalytics      from './pages/superadmin/Analytics'
import SuperAdminDepartments from './pages/superadmin/Departments'
import SuperAdminAuditLogs from './pages/superadmin/AuditLogs'

// Admin pages
import AdminDashboard  from './pages/admin/Dashboard'
import AdminDepartments from './pages/admin/Departments'
import AdminStudents   from './pages/admin/Students'
import AdminReports    from './pages/admin/Reports'

// HOD pages
import HodDashboard    from './pages/hod/Dashboard'
// import ApproveMarks    from './pages/hod/ApproveMarks'
import HodReports      from './pages/hod/Reports'
import HodAnalytics    from './pages/hod/Analytics'

// Professor pages
import ProfDashboard   from './pages/professor/Dashboard'
import MarksEntry      from './pages/professor/MarksEntry'
import AttendanceMark  from './pages/professor/Attendance'
import MySubjects      from './pages/professor/MySubjects'
import ProfAnalytics  from './pages/professor/Analytics'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import MyMarks          from './pages/student/MyMarks'
import StudentAttendance from './pages/student/Attendance'
import Marksheet        from './pages/student/Marksheet'

// Full-page loader
import PageLoader from './components/common/PageLoader'

export default function App() {
  const dispatch      = useDispatch()
  const user          = useSelector(selectCurrentUser)
  const isInitialising = useSelector(selectIsInitialising)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      dispatch(fetchMe())
    } else {
      dispatch({ type: 'auth/setInitialised' })
    }
  }, [dispatch])

  if (isInitialising) return <PageLoader />

  const rolePath = {
    superadmin: '/superadmin',
    admin:      '/admin',
    hod:        '/hod',
    professor:  '/professor',
    student:    '/student',
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* ── Auth routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"          element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
        </Route>

        {/* ── Root redirect ── */}
        <Route path="/"
          element={user ? <Navigate to={rolePath[user.role] || '/login'} replace /> : <Navigate to="/login" replace />}
        />

        {/* ── Super Admin ── */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route element={<DashLayout role="superadmin" />}>
            <Route path="/superadmin"            element={<SuperAdminDashboard />} />
            <Route path="/superadmin/users"      element={<ManageUsers />} />
            <Route path="/superadmin/analytics"  element={<SuperAnalytics />} />
            <Route path="/superadmin/departments" element={<SuperAdminDepartments />} />
            <Route path="/superadmin/audit"      element={<SuperAdminAuditLogs />} />
            <Route path="/superadmin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
          <Route element={<DashLayout role="admin" />}>
            <Route path="/admin"              element={<AdminDashboard />} />
            <Route path="/admin/departments"  element={<AdminDepartments />} />
            <Route path="/admin/students"     element={<AdminStudents />} />
            <Route path="/admin/reports"      element={<AdminReports />} />
            <Route path="/admin/settings" element={<Settings />} />
            
          </Route>
        </Route>

        {/* ── HOD ── */}
        <Route element={<ProtectedRoute allowedRoles={['hod', 'admin', 'superadmin']} />}>
          <Route element={<DashLayout role="hod" />}>
            <Route path="/hod"               element={<HodDashboard />} />
            {/* <Route path="/hod/approve-marks" element={<ApproveMarks />} /> */}
            <Route path="/hod/reports"       element={<HodReports />} />
            <Route path="/hod/analytics" element={<HodAnalytics />} />
            <Route path="/hod/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ── Professor ── */}
        <Route element={<ProtectedRoute allowedRoles={['professor', 'hod', 'admin', 'superadmin']} />}>
          <Route element={<DashLayout role="professor" />}>
            <Route path="/professor"            element={<ProfDashboard />} />
            <Route path="/professor/marks"      element={<MarksEntry />} />
            <Route path="/professor/attendance" element={<AttendanceMark />} />
            <Route path="/professor/subjects"   element={<MySubjects />} />
            <Route path="/professor/analytics" element={<ProfAnalytics />} />
            <Route path="/professor/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ── Student ── */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<DashLayout role="student" />}>
            <Route path="/student"            element={<StudentDashboard />} />
            <Route path="/student/marks"      element={<MyMarks />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/marksheet"  element={<Marksheet />} />
            <Route path="/student/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
