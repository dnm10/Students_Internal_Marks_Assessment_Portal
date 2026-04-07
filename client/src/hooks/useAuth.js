/**
 * hooks/useAuth.js — Auth helper hook
 */
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectUserRole,
  logoutUser,
} from '../store/slices/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const navigate  = useNavigate()

  const user            = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading       = useSelector(selectAuthLoading)
  const role            = useSelector(selectUserRole)

  const logout = async () => {
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  const can = (...roles) => roles.includes(role)

  const isStudent    = role === 'student'
  const isProfessor  = role === 'professor'
  const isHod        = role === 'hod'
  const isAdmin      = role === 'admin' || role === 'superadmin'
  const isSuperAdmin = role === 'superadmin'

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    logout,
    can,
    isStudent,
    isProfessor,
    isHod,
    isAdmin,
    isSuperAdmin,
  }
}
