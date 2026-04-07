import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Sparkles } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { forgotPassword } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const schema = z.object({ email: z.string().email('Enter a valid email') })

export default function ForgotPassword() {
  const dispatch = useDispatch()
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState:{ errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }) => {
    setLoading(true)
    const res = await dispatch(forgotPassword(email))
    if (!res.error) {
      setSent(true)
      toast.success('Reset link sent if account exists')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto shadow-glow">
          <Sparkles className="w-7 h-7 text-white"/>
        </div>
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-slate-400 text-sm">Enter your email to receive a reset link</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        {sent ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-emerald-400"/>
            </div>
            <p className="text-white font-semibold">Check your email</p>
            <p className="text-slate-400 text-sm">A password reset link has been sent. It expires in 1 hour.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-sm mt-2">
              <ArrowLeft className="w-4 h-4"/> Back to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <input {...register('email')} type="email" placeholder="you@portal.edu"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`} />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>

      {!sent && (
        <div className="text-center">
          <Link to="/login" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4"/> Back to Login
          </Link>
        </div>
      )}
    </div>
  )
}
