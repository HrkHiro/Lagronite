import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MdEmail, MdLock, MdLogin, MdArrowBack } from 'react-icons/md'
import { useAuth } from '../../hooks/useAuth.js'
import { loginStudent } from '../../services/authService.js'

const initialErrors = { email: '', password: '', form: '' }

export function Login() {
  const { isAuthenticated, role, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState(initialErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
  }, [isAuthenticated, navigate, role])

  const getNextRoute = (userRole) => {
    const protectedRoute = location.state?.from?.pathname
    return protectedRoute || (userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard')
  }

  const validate = () => {
    const nextErrors = { ...initialErrors }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!loginData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!emailPattern.test(loginData.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (!loginData.password) {
      nextErrors.password = 'Password is required'
    }
    setErrors(nextErrors)
    return !nextErrors.email && !nextErrors.password
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setLoginData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setErrors(initialErrors)
    try {
      const response = await loginStudent({
        email: loginData.email.trim(),
        password: loginData.password,
        rememberMe: loginData.rememberMe,
      })
      const authUser = response.user ? { ...response.user, token: response.token } : response
      login(authUser, loginData.rememberMe)
      navigate(getNextRoute(authUser.role), { replace: true })
    } catch (error) {
      setErrors((current) => ({ ...current, form: error.message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-rise { animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>

      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center mb-8 anim-rise" style={{ animationDelay: '0.05s' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Sign in to continue your recovery search.
          </h1>
          <p className="mt-2 max-w-lg mx-auto text-sm leading-6 text-slate-400">
            Access your student dashboard, track reports, and manage item recovery activity.
          </p>
          <Link to="/" className="inline-flex items-center gap-1.5 mt-3 text-sm text-slate-500 transition hover:text-emerald-300">
            <MdArrowBack className="text-base" />
            Back to home
          </Link>
        </div>

        <div className="w-full max-w-lg anim-rise" style={{ animationDelay: '0.15s' }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Login</h3>
              <Link to="/register" className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300">
                Create account →
              </Link>
            </div>

            {errors.form && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
                {errors.form}
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="student@college.edu"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                />
                {errors.email && <p className="mt-1 text-xs text-rose-300">{errors.email}</p>}
              </div>

              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                />
                {errors.password && <p className="mt-1 text-xs text-rose-300">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="select-none">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdLogin className="text-lg" />
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}