import { motion } from 'framer-motion'
import { clsx } from 'clsx'

/**
 * StatsCard — glassmorphism stat card with optional trend indicator
 */
export function StatsCard({ title, value, subtitle, icon: Icon, color = 'primary', trend, delay = 0 }) {
  const colorMap = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20 text-primary-400',
    cyan:    'from-accent-500/20 to-accent-600/10 border-accent-500/20 text-accent-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    amber:   'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
    red:     'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
    violet:  'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="glass-card p-5 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <p className={clsx('text-xs font-medium mt-2', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx(
            'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
            colorMap[color] || colorMap.primary
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * SkeletonCard — loading skeleton for stats
 */
export function SkeletonCard() {
  return (
    <div className="glass p-5 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-32 rounded-lg" />
      <div className="skeleton h-3 w-20 rounded-full" />
    </div>
  )
}

/**
 * InfoCard — card with header and content slot
 */
export function InfoCard({ title, subtitle, children, actions, className = '', noPad = false }) {
  return (
    <div className={clsx('glass-card', !noPad && 'p-5', className)}>
      {(title || actions) && (
        <div className={clsx('flex items-center justify-between', !noPad ? 'mb-4' : 'p-5 border-b border-white/[0.06]')}>
          <div>
            {title && <h3 className="font-semibold text-white text-sm">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
