import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { apiUrl, getAuthHeaders } from '../../services/api.js'
import {
  MdTitle,
  MdCategory,
  MdColorLens,
  MdDescription,
  MdCalendarToday,
  MdLocationOn,
  MdImage,
  MdSend,
  MdError,
  MdCheckCircle,
  MdInfo,
  MdSearchOff,
} from 'react-icons/md'

const initialFormState = {
  itemName: '',
  category: '',
  color: '',
  description: '',
  dateLost: '',
  locationLost: '',
  image: null,
}

const categories = ['Electronics', 'Books', 'Stationery', 'Clothing', 'Accessories', 'Documents', 'Other']
const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown', 'Other']

const initialErrors = {
  itemName: '',
  category: '',
  color: '',
  description: '',
  dateLost: '',
  locationLost: '',
  image: '',
  form: '',
}

function FieldError({ children, isDark }) {
  if (!children) return null
  return (
    <p className={`flex items-center gap-1.5 text-sm font-medium ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
      <MdError className="text-base flex-shrink-0" />
      {children}
    </p>
  )
}

function buildDateLimit() {
  return new Date().toISOString().split('T')[0]
}

export function ReportLostItem() {
  const [formData, setFormData] = useState(initialFormState)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errors, setErrors] = useState(initialErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const { theme } = useOutletContext() // Get theme from layout

  const isDark = theme === 'dark'

  const maxDate = useMemo(() => buildDateLimit(), [])

  const validate = () => {
    const nextErrors = { ...initialErrors }
    if (!formData.itemName.trim()) nextErrors.itemName = 'Item name is required'
    if (!formData.category) nextErrors.category = 'Select a category'
    if (!formData.color) nextErrors.color = 'Select a color'
    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters'
    }
    if (!formData.dateLost) nextErrors.dateLost = 'Select the date lost'
    if (!formData.locationLost.trim()) nextErrors.locationLost = 'Location lost is required'
    if (!formData.image) nextErrors.image = 'Upload an item image'
    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleChange = (event) => {
    const { name, value, type, files } = event.target
    if (type === 'file') {
      const file = files?.[0]
      if (!file) {
        setFormData((current) => ({ ...current, image: null }))
        setPreviewUrl('')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const result = String(reader.result || '')
        setFormData((current) => ({ ...current, image: result }))
        setPreviewUrl(result)
      }
      reader.readAsDataURL(file)
      return
    }
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage({ type: '', text: '' })
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(apiUrl('/api/lost-items'), {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (data?.errors) {
          setErrors((current) => ({ ...current, ...data.errors, form: data.message || 'Submission failed' }))
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to submit report' })
        }
        return
      }

      setFormData(initialFormState)
      setPreviewUrl('')
      setErrors(initialErrors)
      setMessage({ type: 'success', text: data.message || 'Lost item reported successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Something went wrong' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes shine {
          from { transform: translateX(-120%) skewX(-15deg); }
          to { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .shine-btn { position: relative; overflow: hidden; }
        .shine-btn::after {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.45), transparent);
          transform: translateX(-120%) skewX(-15deg);
        }
        .shine-btn:hover::after { animation: shine 0.85s ease forwards; }
        .dot-grid-dark {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .dot-grid-light {
          background-image: radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      {/* Background decorations */}
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-10">
        {/* Header card - INCREASED padding and fonts */}
        <div className={`anim-rise overflow-hidden rounded-[2rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg mb-8`}>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-1">
              <MdSearchOff className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Student Module
              </p>
            </div>
            <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Report a Lost Item
            </h1>
            <p className={`mt-4 max-w-xl text-base leading-7 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Submit the details of your lost item so the recovery team can match it with found items on campus.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Form card - INCREASED padding */}
        <div className={`anim-rise overflow-hidden rounded-[2rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-xl`}>
          <div className="p-8 lg:p-10">
            {message.text && (
              <div
                className={`mb-8 rounded-2xl border px-6 py-5 flex items-start gap-3 ${
                  message.type === 'success'
                    ? isDark
                      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                      : 'border-emerald-400/30 bg-emerald-50 text-emerald-800'
                    : isDark
                      ? 'border-rose-400/20 bg-rose-500/10 text-rose-200'
                      : 'border-rose-400/30 bg-rose-50 text-rose-800'
                }`}
              >
                {message.type === 'success' ? (
                  <MdCheckCircle className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                ) : (
                  <MdError className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
                )}
                <p className="text-base font-medium">{message.text}</p>
              </div>
            )}

            <form className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleSubmit}>
              {/* LEFT COLUMN - Form Fields */}
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      <MdTitle className="text-xl" />
                      Item Name
                    </span>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                        isDark
                          ? 'border-white/10 bg-slate-950 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                      placeholder="e.g. Samsung Charger"
                    />
                    <FieldError isDark={isDark}>{errors.itemName}</FieldError>
                  </label>

                  <label className="space-y-2">
                    <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      <MdCategory className="text-xl" />
                      Category
                    </span>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-200 appearance-none cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-slate-950 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 1rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '3rem',
                      }}
                    >
                      <option value="" className={isDark ? 'bg-slate-950' : 'bg-white'}>
                        Select category
                      </option>
                      {categories.map((category) => (
                        <option key={category} value={category} className={isDark ? 'bg-slate-950' : 'bg-white'}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <FieldError isDark={isDark}>{errors.category}</FieldError>
                  </label>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      <MdColorLens className="text-xl" />
                      Color
                    </span>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-200 appearance-none cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-slate-950 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 1rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '3rem',
                      }}
                    >
                      <option value="" className={isDark ? 'bg-slate-950' : 'bg-white'}>
                        Select color
                      </option>
                      {colors.map((color) => (
                        <option key={color} value={color} className={isDark ? 'bg-slate-950' : 'bg-white'}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <FieldError isDark={isDark}>{errors.color}</FieldError>
                  </label>

                  <label className="space-y-2">
                    <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      <MdCalendarToday className="text-xl" />
                      Date Lost
                    </span>
                    <input
                      type="date"
                      name="dateLost"
                      value={formData.dateLost}
                      max={maxDate}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-200 ${
                        isDark
                          ? 'border-white/10 bg-slate-950 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 [color-scheme:dark]'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                    />
                    <FieldError isDark={isDark}>{errors.dateLost}</FieldError>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    <MdLocationOn className="text-xl" />
                    Location Lost
                  </span>
                  <input
                    type="text"
                    name="locationLost"
                    value={formData.locationLost}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                      isDark
                        ? 'border-white/10 bg-slate-950 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    }`}
                    placeholder="e.g. Library, Block A"
                  />
                  <FieldError isDark={isDark}>{errors.locationLost}</FieldError>
                </label>

                <label className="block space-y-2">
                  <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    <MdDescription className="text-xl" />
                    Description
                  </span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-200 resize-none placeholder:text-base ${
                      isDark
                        ? 'border-white/10 bg-slate-950 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    }`}
                    placeholder="Describe the item, brand, unique marks, or any identifying details"
                  />
                  <FieldError isDark={isDark}>{errors.description}</FieldError>
                </label>

                <label className="block space-y-2">
                  <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    <MdImage className="text-xl" />
                    Upload Item Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className={`w-full rounded-2xl border border-dashed px-5 py-4 text-base transition-all duration-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-5 file:py-2.5 file:text-base file:font-semibold file:text-white file:transition-all hover:file:bg-emerald-400 file:cursor-pointer ${
                      isDark
                        ? 'border-white/15 bg-slate-950 text-slate-300'
                        : 'border-gray-300 bg-white text-gray-600'
                    }`}
                  />
                  <FieldError isDark={isDark}>{errors.image}</FieldError>
                </label>
              </div>

              {/* RIGHT COLUMN - Preview & Rules */}
              <aside className="space-y-6">
                <div className={`rounded-3xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'} p-6 backdrop-blur-sm`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Image Preview
                    </h3>
                    <span className={`rounded-full border ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-1.5 text-sm font-medium uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Before Upload
                    </span>
                  </div>
                  <div className={`mt-4 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-100'}`}>
                    {previewUrl ? (
                      <img src={previewUrl} alt="Item preview" className="h-80 w-full object-cover" />
                    ) : (
                      <div className={`flex h-80 items-center justify-center px-8 text-center text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        <div>
                          <MdImage className={`text-5xl mx-auto mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                          Your selected image will appear here before submission.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`rounded-3xl border ${isDark ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-emerald-400/30 bg-emerald-50'} p-6 backdrop-blur-sm`}>
                  <p className={`flex items-center gap-2 text-base font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    <MdInfo className="text-xl" />
                    Submission Rules
                  </p>
                  <ul className={`mt-4 space-y-3 text-base leading-6 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Fill every required field before submitting.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Use clear item descriptions for better matching.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Only image uploads are accepted for previews.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      The item status is automatically saved as Lost.
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shine-btn w-full rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MdSend className="text-2xl" />
                      Submit Lost Item
                    </>
                  )}
                </button>

                {errors.form && (
                  <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10' : 'border-rose-400/30 bg-rose-50'} px-5 py-4 flex items-start gap-3`}>
                    <MdError className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
                    <p className={`text-base font-medium ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                      {errors.form}
                    </p>
                  </div>
                )}
              </aside>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}