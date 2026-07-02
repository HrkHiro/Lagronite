import { useMemo, useState } from 'react'

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

function FieldError({ children }) {
  if (!children) return null
  return <p className="text-sm text-rose-300">{children}</p>
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
      const response = await fetch('http://localhost:5000/api/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* Animations */}
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
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header card */}
        <div className="anim-rise overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-6">
          <div className="p-6 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Student Module
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Report a Lost Item
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Submit the details of your lost item so the recovery team can match it with found items on campus.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Form card */}
        <div className="anim-rise overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]">
          <div className="p-6 lg:p-8">
            {message.text && (
              <div
                className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                    : 'border-rose-400/20 bg-rose-500/10 text-rose-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <form className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Item Name</span>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                      placeholder="e.g. Samsung Charger"
                    />
                    <FieldError>{errors.itemName}</FieldError>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Category</span>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <FieldError>{errors.category}</FieldError>
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Color</span>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    >
                      <option value="">Select color</option>
                      {colors.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    <FieldError>{errors.color}</FieldError>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Date Lost</span>
                    <input
                      type="date"
                      name="dateLost"
                      value={formData.dateLost}
                      max={maxDate}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                    <FieldError>{errors.dateLost}</FieldError>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Location Lost</span>
                  <input
                    type="text"
                    name="locationLost"
                    value={formData.locationLost}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                    placeholder="e.g. Library, Block A"
                  />
                  <FieldError>{errors.locationLost}</FieldError>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Description</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                    placeholder="Describe the item, brand, unique marks, or any identifying details"
                  />
                  <FieldError>{errors.description}</FieldError>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Upload Item Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-dashed border-white/15 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-emerald-400"
                  />
                  <FieldError>{errors.image}</FieldError>
                </label>
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">Image Preview</h3>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      Before Upload
                    </span>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Item preview" className="h-72 w-full object-cover" />
                    ) : (
                      <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-slate-400">
                        Your selected image will appear here before submission.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 backdrop-blur-sm">
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Submission Rules</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    <li>• Fill every required field before submitting.</li>
                    <li>• Use clear item descriptions for better matching.</li>
                    <li>• Only image uploads are accepted for previews.</li>
                    <li>• The item status is automatically saved as Lost.</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shine-btn w-full rounded-2xl bg-emerald-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Lost Item'}
                </button>

                <FieldError>{errors.form}</FieldError>
              </aside>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}