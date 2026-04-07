import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsInitialising } from '../../store/slices/authSlice'
import PageLoader from '../common/PageLoader'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const user          = useSelector(selectCurrentUser)
  const isInitialising = useSelector(selectIsInitialising)

  if (isInitialising) return <PageLoader />
  if (!user)          return <Navigate to="/login" replace />
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Redirect to role's home
    const roleHome = { superadmin: '/superadmin', admin: '/admin', hod: '/hod', professor: '/professor', student: '/student' }
    return <Navigate to={roleHome[user.role] || '/login'} replace />
  }

  return <Outlet />
}
