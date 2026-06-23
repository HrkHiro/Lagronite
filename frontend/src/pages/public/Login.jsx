import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { loginStudent } from '../../services/authService.js'

const initialErrors = { email: '', password: '', form: '' }

export function Login() {
  const { isAuthenticated, role, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState(initialErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
  }, [isAuthenticated, navigate, role])

  const getNextRoute = (userRole) => {
    const protectedRoute = location.state?.from?.pathname

    if (protectedRoute) {
      return protectedRoute
    }

    return userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'
  }

  const validate = () => {
    const nextErrors = { ...initialErrors }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    }

    setErrors(nextErrors)
    return !nextErrors.email && !nextErrors.password
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setErrors(initialErrors)

    try {
      const response = await loginStudent({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      })

      const authUser = response.user ? { ...response.user, token: response.token } : response
      login(authUser, formData.rememberMe)
      navigate(getNextRoute(authUser.role), { replace: true })
    } catch (error) {
      setErrors((current) => ({ ...current, form: error.message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
      <section className="space-y-4 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">Welcome back</p>
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Sign in to continue your recovery search.</h2>
        <p className="max-w-xl text-slate-300">
          Access your student dashboard, track reports, and manage item recovery activity.
        </p>
      </section>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl shadow-slate-950/30">
      <h3 className="text-2xl font-semibold">Login</h3>
      <p className="mt-2 text-sm text-slate-300">Use your student or admin account to access the platform.</p>

        {errors.form ? <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{errors.form}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              placeholder="student@college.edu"
            />
            {errors.email ? <span className="text-sm text-rose-300">{errors.email}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              placeholder="Enter your password"
            />
            {errors.password ? <span className="text-sm text-rose-300">{errors.password}</span> : null}
          </label>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-500"
              />
              Remember me
            </label>
            <Link to="/register" className="text-sm text-emerald-300 hover:text-emerald-200">
              Create account
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}