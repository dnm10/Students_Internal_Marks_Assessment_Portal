import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { resetPassword } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const schema = z.object({
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Need one uppercase letter')
    .regex(/[a-z]/, 'Need one lowercase letter')
    .regex(/\d/,   'Need one number')
    .regex(/[@$!%*?&]/, 'Need one special character'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

export default function ResetPassword() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const token     = params.get('token') || ''
  const [showP, setShowP] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState:{ errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ newPassword }) => {
    if (!token) { toast.error('Invalid or missing reset token'); return }
    setLoading(true)
    const res = await dispatch(resetPassword({ token, newPassword }))
    if (!res.error) {
      toast.success('Password reset! Please log in.')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto shadow-glow">
          <KeyRound className="w-7 h-7 text-white"/>
        </div>
        <h1 className="text-2xl font-bold text-white">Set New Password</h1>
        <p className="text-slate-400 text-sm">Create a strong password for your account</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        {!token ? (
          <p className="text-red-400 text-sm text-center py-4">
            Invalid reset link. <Link to="/forgot-password" className="text-primary-400">Request a new one</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {['newPassword','confirmPassword'].map((field, i) => (
              <div key={field} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  {i === 0 ? 'New Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input {...register(field)} type={showP ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pr-10 ${errors[field] ? 'border-red-500' : ''}`} />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowP(!showP)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showP ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  )}
                </div>
                {errors[field] && <p className="text-xs text-red-400">{errors[field].message}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>

      <div className="text-center">
        <Link to="/login" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}
