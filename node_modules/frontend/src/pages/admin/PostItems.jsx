import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { request } from '../../services/api.js'
import {
  MdCategory,
  MdColorLens,
  MdDescription,
  MdImage,
  MdCalendarToday,
  MdLocationOn,
  MdPostAdd,
  MdDashboard,
  MdTitle,
  MdInfoOutline,
  MdError,
  MdCheckCircle,
  MdSend,
} from 'react-icons/md'

const initialState = {
  type: 'lost',
  itemName: '',
  category: '',
  color: '',
  description: '',
  dateLost: '',
  dateFound: '',
  locationLost: '',
  locationFound: '',
  image: '',
}

const categories = ['Electronics', 'Books', 'Stationery', 'Clothing', 'Accessories', 'Documents', 'Other']
const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown', 'Other']

function FieldError({ children, isDark }) {
  if (!children) return null
  return (
    <p className={`flex items-center gap-1.5 text-sm font-medium mt-1.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
      <MdError className="text-base flex-shrink-0" />
      {children}
    </p>
  )
}

export function AdminPostItems() {
  const [formData, setFormData] = useState(initialState)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { theme } = useOutletContext() || {}
  
  const isDark = theme === undefined ? true : theme === 'dark'

  const handleChange = (event) => {
    const { name, value, type, files } = event.target
    if (type === 'file') {
      const file = files?.[0]
      if (!file) {
        setFormData((current) => ({ ...current, image: '' }))
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

  const validate = () => {
    const nextErrors = {}
    if (!formData.itemName.trim()) nextErrors.itemName = 'Item name is required'
    if (!formData.category) nextErrors.category = 'Category is required'
    if (!formData.color) nextErrors.color = 'Color is required'
    if (!formData.description.trim()) nextErrors.description = 'Description is required'
    if (formData.type === 'lost' && !formData.dateLost) nextErrors.dateLost = 'Date lost is required'
    if (formData.type === 'found' && !formData.dateFound) nextErrors.dateFound = 'Date found is required'
    if (formData.type === 'lost' && !formData.locationLost.trim()) nextErrors.locationLost = 'Location lost is required'
    if (formData.type === 'found' && !formData.locationFound.trim()) nextErrors.locationFound = 'Location found is required'
    if (!formData.image) nextErrors.image = 'Image is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage({ type: '', text: '' })
    if (!validate()) return

    setIsSubmitting(true)
    const endpoint = formData.type === 'lost' ? '/api/lost-items' : '/api/found-items'
    const payload =
      formData.type === 'lost'
        ? {
            itemName: formData.itemName,
            category: formData.category,
            color: formData.color,
            description: formData.description,
            dateLost: formData.dateLost,
            locationLost: formData.locationLost,
            image: formData.image,
          }
        : {
            itemName: formData.itemName,
            category: formData.category,
            color: formData.color,
            description: formData.description,
            dateFound: formData.dateFound,
            locationFound: formData.locationFound,
            image: formData.image,
          }

    try {
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setFormData(initialState)
      setPreviewUrl('')
      setErrors({})
      setMessage({ type: 'success', text: data.message || 'Item posted successfully' })
    } catch (error) {
      if (error?.payload?.errors) {
        setErrors((current) => ({ ...current, ...error.payload.errors }))
      }
      setMessage({ type: 'error', text: error.message || 'Something went wrong' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
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
      `}</style>

      {/* Background decorations */}
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.12]'} blur-[140px]`} />
      <div className={`glow-b absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.12]'} blur-[140px]`} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Form Card */}
        <div className={`anim-rise overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-8 shadow-xl backdrop-blur-xl md:p-10`}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <MdPostAdd className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Admin Module
              </p>
            </div>
            <h2 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Post Lost or Found Items
            </h2>
            <p className={`mt-3 max-w-3xl text-base leading-7 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Post on behalf of students when a lost or found item needs to be recorded.
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 rounded-xl border px-5 py-4 flex items-start gap-3 text-base font-medium ${
              message.type === 'success'
                ? isDark
                  ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                  : 'border-emerald-400/30 bg-emerald-50 text-emerald-800'
                : isDark
                  ? 'border-rose-400/20 bg-rose-500/10 text-rose-200'
                  : 'border-rose-400/30 bg-rose-50 text-rose-800'
            }`}>
              {message.type === 'success' ? (
                <MdCheckCircle className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
              ) : (
                <MdError className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
              )}
              {message.text}
            </div>
          )}

          <form className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleSubmit}>
            {/* LEFT COLUMN – form fields */}
            <div className="space-y-5">
              {/* Type Select */}
              <div className="relative">
                <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Report Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-5 py-4 text-base outline-none transition-all duration-200 appearance-none cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-slate-900/60 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
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
                  <option value="lost" className={isDark ? 'bg-slate-900' : 'bg-white'}>Lost Item</option>
                  <option value="found" className={isDark ? 'bg-slate-900' : 'bg-white'}>Found Item</option>
                </select>
              </div>

              {/* Item Name & Category */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Item Name
                  </label>
                  <div className="relative">
                    <MdTitle className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    <input
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      placeholder="e.g. iPhone 15"
                      className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                        isDark
                          ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                    />
                  </div>
                  <FieldError isDark={isDark}>{errors.itemName}</FieldError>
                </div>

                <div>
                  <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <div className="relative">
                    <MdCategory className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full rounded-xl border pl-12 pr-10 py-4 text-base outline-none transition-all duration-200 appearance-none cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-slate-900/60 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 1rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                      }}
                    >
                      <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className={isDark ? 'bg-slate-900' : 'bg-white'}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <FieldError isDark={isDark}>{errors.category}</FieldError>
                </div>
              </div>

              {/* Color & Image */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Color
                  </label>
                  <div className="relative">
                    <MdColorLens className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className={`w-full rounded-xl border pl-12 pr-10 py-4 text-base outline-none transition-all duration-200 appearance-none cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-slate-900/60 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                          : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 1rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                      }}
                    >
                      <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>Select Color</option>
                      {colors.map((col) => (
                        <option key={col} value={col} className={isDark ? 'bg-slate-900' : 'bg-white'}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <FieldError isDark={isDark}>{errors.color}</FieldError>
                </div>

                <div>
                  <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Upload Image
                  </label>
                  <div className="relative">
                    <MdImage className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className={`w-full rounded-xl border border-dashed pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-5 file:py-2.5 file:text-base file:font-semibold file:text-white file:transition-all hover:file:bg-emerald-400 file:cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-slate-900/60 text-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                          : 'border-gray-300 bg-white text-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      }`}
                    />
                  </div>
                  <FieldError isDark={isDark}>{errors.image}</FieldError>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <div className="relative">
                  <MdDescription className={`absolute left-4 top-4 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the item in detail..."
                    className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 resize-none placeholder:text-base ${
                      isDark
                        ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    }`}
                  />
                </div>
                <FieldError isDark={isDark}>{errors.description}</FieldError>
              </div>

              {/* Date & Location (conditional) */}
              {formData.type === 'lost' ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      Date Lost
                    </label>
                    <div className="relative">
                      <MdCalendarToday className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        type="date"
                        name="dateLost"
                        value={formData.dateLost}
                        onChange={handleChange}
                        className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 ${
                          isDark
                            ? 'border-white/10 bg-slate-900/60 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 [color-scheme:dark]'
                            : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        }`}
                      />
                    </div>
                    <FieldError isDark={isDark}>{errors.dateLost}</FieldError>
                  </div>
                  <div>
                    <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      Location Lost
                    </label>
                    <div className="relative">
                      <MdLocationOn className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        name="locationLost"
                        value={formData.locationLost}
                        onChange={handleChange}
                        placeholder="e.g. Library"
                        className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                          isDark
                            ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                            : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        }`}
                      />
                    </div>
                    <FieldError isDark={isDark}>{errors.locationLost}</FieldError>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      Date Found
                    </label>
                    <div className="relative">
                      <MdCalendarToday className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        type="date"
                        name="dateFound"
                        value={formData.dateFound}
                        onChange={handleChange}
                        className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 ${
                          isDark
                            ? 'border-white/10 bg-slate-900/60 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 [color-scheme:dark]'
                            : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        }`}
                      />
                    </div>
                    <FieldError isDark={isDark}>{errors.dateFound}</FieldError>
                  </div>
                  <div>
                    <label className={`block text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      Location Found
                    </label>
                    <div className="relative">
                      <MdLocationOn className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        name="locationFound"
                        value={formData.locationFound}
                        onChange={handleChange}
                        placeholder="e.g. Cafeteria"
                        className={`w-full rounded-xl border pl-12 pr-4 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
                          isDark
                            ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                            : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                        }`}
                      />
                    </div>
                    <FieldError isDark={isDark}>{errors.locationFound}</FieldError>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-3 w-full rounded-xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Posting...
                  </>
                ) : (
                  <>
                    <MdSend className="text-2xl" />
                    Post Item
                  </>
                )}
              </button>
            </div>

            {/* RIGHT COLUMN – preview + info */}
            <aside className="space-y-5">
              {/* Image Preview */}
              <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'} p-5 backdrop-blur-sm`}>
                <p className={`text-sm font-semibold uppercase tracking-[0.18em] flex items-center gap-2 mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <MdImage className="text-xl" />
                  Image Preview
                </p>
                <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/70' : 'border-gray-200 bg-gray-100'}`}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Item preview" className="h-64 w-full object-cover" />
                  ) : (
                    <div className={`flex h-64 items-center justify-center text-base ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                      <div className="text-center">
                        <MdImage className="text-5xl mx-auto mb-3" />
                        <p>No image selected</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Info */}
              <div className={`rounded-xl border ${isDark ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-emerald-400/30 bg-emerald-50'} p-5 backdrop-blur-sm`}>
                <p className={`text-base font-bold flex items-center gap-2 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <MdDashboard className={`text-xl ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                  Admin Posting Access
                </p>
                <p className={`text-base leading-7 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  Admins can create both lost and found reports for students. Images are uploaded to Cloudinary and stored as secure URLs.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </section>
  )
}