import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 border-primary-500/30 border-t-primary-500"
      />
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Sparkles className="w-4 h-4 text-primary-500" />
        <span>Loading portal…</span>
      </div>
    </div>
  )
}
