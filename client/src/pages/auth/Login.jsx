import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, GraduationCap, AlertCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginUser, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const DEMO_ACCOUNTS = [
  { label:'Super Admin', email:'superadmin@portal.edu', role:'superadmin' },
  { label:'Admin',       email:'admin@portal.edu',      role:'admin'      },
  { label:'HOD',         email:'hod.cse@portal.edu',    role:'hod'        },
  { label:'Professor',   email:'prof.ramesh@portal.edu', role:'professor'  },
  { label:'Student',     email:'student01@portal.edu',  role:'student'    },
]

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const isLoading = useSelector(selectAuthLoading)
  const authError = useSelector(selectAuthError)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    const result = await dispatch(loginUser(values))
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload.user

      localStorage.setItem("user", JSON.stringify(user))

      // OPTIONAL: store token if needed
      localStorage.setItem("accessToken", result.payload.accessToken)

      const role = user.role

      const paths = {
        superadmin: '/superadmin',
        admin: '/admin',
        hod: '/hod',
        professor: '/professor',
        student: '/student'
      }

      toast.success(`Welcome back!`)
      navigate(paths[role] || '/')
    }
  }

  const fillDemo = (account) => {
    setValue('email', account.email)
    setValue('password', 'Password@123')
    toast(`Demo: ${account.label}`, { icon:'👤' })
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto shadow-glow animate-float">
          <GraduationCap className="w-7 h-7 text-white"/>
        </div>
        <h1 className="text-2xl font-bold text-white">Student Marks Portal</h1>
        <p className="text-slate-400 text-sm">Sign in to access your academic dashboard</p>
      </div>

      {/* Form */}
      <div className="glass-card p-6 space-y-5">
        {authError && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0"/>
            {authError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@portal.edu"
              autoComplete="email"
              className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Signing in…</span></>
            ) : (
              <><LogIn className="w-4 h-4"/><span>Sign In</span></>
            )}
          </button>
        </form>
      </div>

      {/* Demo accounts */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 text-center uppercase tracking-wider">Demo Accounts (Password: Password@123)</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {DEMO_ACCOUNTS.map(acc => (
            <button key={acc.role} onClick={() => fillDemo(acc)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium glass text-slate-400 hover:text-white hover:border-primary-500/40 transition-all capitalize">
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
