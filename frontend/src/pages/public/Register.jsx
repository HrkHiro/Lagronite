import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdArrowBack, 
  MdPersonAdd,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md'
import { useAuth } from '../../hooks/useAuth.js'
import { registerStudent } from '../../services/authService.js'

const initialErrors = { name: '', email: '', password: '', confirmPassword: '', form: '' }

export function Register({ isDark: propIsDark }) {
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Check if dark mode class exists on HTML element
  const isDark = propIsDark !== undefined ? propIsDark : document.documentElement.classList.contains('dark')

  useEffect(() => {
    if (!isAuthenticated) return
    navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
  }, [isAuthenticated, navigate, role])

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', color: '', width: '0%' }
    
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { strength: 'Weak', color: 'text-rose-400', width: '33%', bgColor: 'bg-rose-400' }
    if (score <= 3) return { strength: 'Medium', color: 'text-amber-400', width: '66%', bgColor: 'bg-amber-400' }
    return { strength: 'Strong', color: 'text-emerald-400', width: '100%', bgColor: 'bg-emerald-400' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validate = () => {
    const nextErrors = { ...initialErrors }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters'
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
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return !nextErrors.name && !nextErrors.email && !nextErrors.password && !nextErrors.confirmPassword
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

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
    <section className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes slideIn {
          from { width: 0; }
          to { width: var(--target-width); }
        }
        .anim-rise { animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .dot-grid-dark {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .dot-grid-light {
          background-image: radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .strength-bar {
          transition: width 0.5s ease-in-out;
        }
      `}</style>

      {/* Background decorations */}
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-12">
        {/* ─── HEADER ─── */}
        <div className="text-center mb-10 anim-rise" style={{ animationDelay: '0.05s' }}>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Join Lagronite
          </p>
          <h1 className={`mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create your student account
          </h1>
          <p className={`mt-3 max-w-lg mx-auto text-base leading-7 sm:text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Register to submit lost item reports, view matches, and manage your recovery history.
          </p>
          <Link
            to="/"
            className={`inline-flex items-center gap-2 mt-4 text-base font-medium transition-colors ${
              isDark ? 'text-slate-500 hover:text-emerald-300' : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            <MdArrowBack className="text-xl" />
            Back to home
          </Link>
        </div>

        {/* ─── REGISTER CARD ─── */}
        <div className="w-full max-w-lg anim-rise" style={{ animationDelay: '0.15s' }}>
          <div className={`rounded-2xl border p-8 backdrop-blur-xl shadow-xl md:p-10 ${
            isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Register
              </h3>
              <Link
                to="/login"
                className="text-base font-medium text-emerald-500 transition hover:text-emerald-400"
              >
                Sign in →
              </Link>
            </div>

            {errors.form && (
              <div className={`mb-6 rounded-xl border px-5 py-4 text-base font-medium flex items-start gap-3 ${
                isDark 
                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' 
                  : 'border-rose-400/30 bg-rose-50 text-rose-800'
              }`}>
                <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
                {errors.form}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div>
                <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <MdPerson className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                      isDark
                        ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className={`mt-2 text-sm font-medium flex items-center gap-1.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                    <span>⚠️</span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <MdEmail className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="lagro@high.school"
                    className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                      isDark
                        ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className={`mt-2 text-sm font-medium flex items-center gap-1.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                    <span>⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <MdLock className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    className={`w-full rounded-xl border pl-12 pr-12 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                      isDark
                        ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-2xl transition-colors ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div
                        className={`strength-bar h-2 rounded-full transition-all duration-500 ${passwordStrength.bgColor}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.strength}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={formData.password.length >= 8 ? 'text-emerald-400' : isDark ? 'text-slate-500' : 'text-gray-400'}>
                          {formData.password.length >= 8 ? <MdCheckCircle className="inline text-sm mr-1" /> : <MdCancel className="inline text-sm mr-1" />}
                          8+ chars
                        </span>
                        <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-400' : isDark ? 'text-slate-500' : 'text-gray-400'}>
                          {/[A-Z]/.test(formData.password) ? <MdCheckCircle className="inline text-sm mr-1" /> : <MdCancel className="inline text-sm mr-1" />}
                          Uppercase
                        </span>
                        <span className={/[0-9]/.test(formData.password) ? 'text-emerald-400' : isDark ? 'text-slate-500' : 'text-gray-400'}>
                          {/[0-9]/.test(formData.password) ? <MdCheckCircle className="inline text-sm mr-1" /> : <MdCancel className="inline text-sm mr-1" />}
                          Number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className={`mt-2 text-sm font-medium flex items-center gap-1.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                    <span>⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <MdLock className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`w-full rounded-xl border pl-12 pr-12 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                      isDark
                        ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-2xl transition-colors ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <p className={`mt-2 text-sm font-medium flex items-center gap-1.5 text-emerald-400`}>
                    <MdCheckCircle className="text-base" />
                    Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className={`mt-2 text-sm font-medium flex items-center gap-1.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                    <span>⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSubmitting ? 'cursor-wait' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <MdPersonAdd className="text-2xl" />
                    Create account
                  </>
                )}
              </button>

              {/* Terms and Login Link */}
              <p className={`text-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-emerald-500 hover:text-emerald-400 transition font-medium">
                  Terms of Service
                </Link>
              </p>

              <div className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                  Sign in here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}