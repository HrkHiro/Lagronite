import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { registerStudent } from '../../services/authService.js'

const initialErrors = { name: '', email: '', password: '', confirmPassword: '', form: '' }

export function Register() {
  const { isAuthenticated, role, login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState(initialErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
  }, [isAuthenticated, navigate, role])

  const validate = () => {
    const nextErrors = { ...initialErrors }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return !nextErrors.name && !nextErrors.email && !nextErrors.password && !nextErrors.confirmPassword
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
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
      const response = await registerStudent({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })

      login(response.user ? { ...response.user, token: response.token } : response, true)
      navigate('/student/dashboard', { replace: true })
    } catch (error) {
      setErrors((current) => ({ ...current, form: error.message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
      <section className="space-y-4 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Join Lagronite</p>
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Create your student account in minutes.</h2>
        <p className="max-w-xl text-slate-300">
          Register to submit lost item reports, view matches, and manage your recovery history.
        </p>
      </section>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl shadow-slate-950/30">
        <h3 className="text-2xl font-semibold">Student Registration</h3>
        <p className="mt-2 text-sm text-slate-300">Only student accounts are created from this form.</p>

        {errors.form ? <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{errors.form}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Full Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300"
              placeholder="Your full name"
            />
            {errors.name ? <span className="text-sm text-rose-300">{errors.name}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300"
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
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300"
              placeholder="Create a strong password"
            />
            {errors.password ? <span className="text-sm text-rose-300">{errors.password}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300"
              placeholder="Repeat your password"
            />
            {errors.confirmPassword ? <span className="text-sm text-rose-300">{errors.confirmPassword}</span> : null}
          </label>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-400">Already have an account?</span>
            <Link to="/login" className="text-sm text-amber-200 hover:text-amber-100">
              Sign in
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}