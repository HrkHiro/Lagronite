import { useState } from 'react'
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

function FieldError({ children }) {
  if (!children) return null
  return <p className="text-xs text-rose-300 mt-1">{children}</p>
}

export function AdminPostItems() {
  const [formData, setFormData] = useState(initialState)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setMessage('')
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
      setMessage(data.message || 'Item posted successfully')
    } catch (error) {
      if (error?.payload?.errors) {
        setErrors((current) => ({ ...current, ...error.payload.errors }))
      }
      setMessage(error.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
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
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
      <div className="glow-b absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Glass‑morphic form card - compact */}
        <div className="anim-rise overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-6">
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Admin Module
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Post Lost or Found Items
            </h2>
            <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-400">
              Post on behalf of students when a lost or found item needs to be recorded.
            </p>
          </div>

          {message && (
            <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-100">
              {message}
            </div>
          )}

          <form className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleSubmit}>
            {/* LEFT COLUMN – form fields */}
            <div className="space-y-4">
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 appearance-none"
                >
                  <option value="lost">Lost Item</option>
                  <option value="found">Found Item</option>
                </select>
                <MdInfoOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <MdTitle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Item name"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 placeholder:text-slate-500"
                  />
                  <FieldError>{errors.itemName}</FieldError>
                </div>
                <div className="relative">
                  <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 appearance-none text-white"
                  >
                    <option value="">Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <FieldError>{errors.category}</FieldError>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <MdColorLens className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 appearance-none text-white"
                  >
                    <option value="">Color</option>
                    {colors.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <FieldError>{errors.color}</FieldError>
                </div>
                <div className="relative">
                  <MdImage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-dashed border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-emerald-200 hover:file:bg-emerald-500/30"
                  />
                  <FieldError>{errors.image}</FieldError>
                </div>
              </div>

              <div className="relative">
                <MdDescription className="absolute left-3 top-3 text-slate-400 text-base" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Description"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 resize-none placeholder:text-slate-500"
                />
                <FieldError>{errors.description}</FieldError>
              </div>

              {formData.type === 'lost' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative">
                    <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                      type="date"
                      name="dateLost"
                      value={formData.dateLost}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 text-white"
                    />
                    <FieldError>{errors.dateLost}</FieldError>
                  </div>
                  <div className="relative">
                    <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                      name="locationLost"
                      value={formData.locationLost}
                      onChange={handleChange}
                      placeholder="Location lost"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 placeholder:text-slate-500"
                    />
                    <FieldError>{errors.locationLost}</FieldError>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative">
                    <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                      type="date"
                      name="dateFound"
                      value={formData.dateFound}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 text-white"
                    />
                    <FieldError>{errors.dateFound}</FieldError>
                  </div>
                  <div className="relative">
                    <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                      name="locationFound"
                      value={formData.locationFound}
                      onChange={handleChange}
                      placeholder="Location found"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 placeholder:text-slate-500"
                    />
                    <FieldError>{errors.locationFound}</FieldError>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdPostAdd className="text-lg" />
                {isSubmitting ? 'Posting...' : 'Post Item'}
              </button>
            </div>

            {/* RIGHT COLUMN – preview + info */}
            <aside className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
                  <MdImage className="text-slate-400" />
                  Image Preview
                </p>
                <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Item preview" className="h-56 w-full object-cover" />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-xs text-slate-400">
                      No image selected
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3.5 text-xs text-slate-200 backdrop-blur-sm">
                <p className="font-medium text-white flex items-center gap-1.5">
                  <MdDashboard className="text-emerald-300" />
                  Admin Posting Access
                </p>
                <p className="mt-1 leading-5">
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