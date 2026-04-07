import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Building2, BarChart3, FileText, Settings,
  GraduationCap, FileBarChart, CheckSquare, ClipboardList, CalendarCheck,
  BookOpen, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'
import { NAV_ITEMS } from '../../utils/constants'
import { logoutUser } from '../../store/slices/authSlice'
import { selectCurrentUser } from '../../store/slices/authSlice'
import { toggleCollapse, selectSidebarCollapsed } from '../../store/slices/uiSlice'
import { getInitials } from '../../utils/helpers'

const iconMap = {
  LayoutDashboard, Users, Building2, BarChart3, FileText, Settings,
  GraduationCap, FileBarChart, CheckSquare, ClipboardList, CalendarCheck,
  BookOpen,
}

export default function Sidebar({ role, collapsed }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectCurrentUser)
  const navItems  = NAV_ITEMS[role] || []

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <div className="h-full flex flex-col glass border-r border-white/[0.06] bg-dark-900/80">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-glow">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-white text-sm leading-tight whitespace-nowrap">Marks Portal</p>
              <p className="text-[10px] text-slate-500 capitalize whitespace-nowrap">{role} panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length === 2}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/[0.06]">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}

        <div className={`flex ${collapsed ? 'justify-center' : 'gap-2'}`}>
          <button
            onClick={() => dispatch(toggleCollapse())}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm flex-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
