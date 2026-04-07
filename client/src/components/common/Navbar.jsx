import { useDispatch, useSelector } from 'react-redux'
import { Menu, Bell, Sun, Moon, Search } from 'lucide-react'
import { toggleSidebar, toggleTheme, selectTheme } from '../../store/slices/uiSlice'
import { selectCurrentUser }    from '../../store/slices/authSlice'
import { selectUnreadCount }    from '../../store/slices/notificationsSlice'
import { getInitials }          from '../../utils/helpers'

export default function Navbar() {
  const dispatch    = useDispatch()
  const user        = useSelector(selectCurrentUser)
  const theme       = useSelector(selectTheme)
  const unreadCount = useSelector(selectUnreadCount)
  

  return (
    <header className="h-16 px-4 md:px-6 flex items-center gap-4 border-b border-white/[0.06] bg-dark-900/60 backdrop-blur-sm sticky top-0 z-20 flex-shrink-0">
      {/* Hamburger (mobile) */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search students, subjects…"
            className="input-field pl-9 py-2 text-sm h-9"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Avatar */}
      {user && (
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[11px] text-slate-500 capitalize">{user.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all">
            {getInitials(user.firstName, user.lastName)}
          </div>
        </div>
      )}
    </header>
  )
}
