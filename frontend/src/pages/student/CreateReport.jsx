import { useState, useRef } from 'react'
import {
  MdPhotoLibrary,
  MdCameraAlt,
  MdDescription,
  MdLocationOn,
  MdCalendarToday,
  MdColorLens,
  MdCategory,
  MdTitle,
} from 'react-icons/md'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const initialState = {
  type: 'lost',
  itemName: '',
  category: '',
  color: '',
  description: '',
  date: '',
  location: '',
  image: '',
}

const categories = ['Electronics', 'Books', 'Stationery', 'Clothing', 'Accessories', 'Documents', 'Other']
const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown', 'Other']

export function CreateReport() {
  const [form, setForm] = useState(initialState)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleImage = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      setPreview(null)
      handleChange('image', '')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(selectedFile)
    setFile(selectedFile)
    handleChange('image', '')
  }

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Image upload failed')
    return data.secure_url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!form.itemName || !form.category || !form.color || !form.date || !form.location) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }
    if (form.description.trim().length < 10) {
      setError('Description must be at least 10 characters')
      setLoading(false)
      return
    }
    if (!file) {
      setError('Please select or take an image')
      setLoading(false)
      return
    }

    try {
      const imageUrl = await uploadImageToCloudinary(file)

      const endpoint =
        form.type === 'lost'
          ? 'http://localhost:5000/api/lost-items'
          : 'http://localhost:5000/api/found-items'

      const payload =
        form.type === 'lost'
          ? {
              itemName: form.itemName,
              category: form.category,
              color: form.color,
              description: form.description,
              dateLost: form.date,
              locationLost: form.location,
              image: imageUrl,
            }
          : {
              itemName: form.itemName,
              category: form.category,
              color: form.color,
              description: form.description,
              dateFound: form.date,
              locationFound: form.location,
              image: imageUrl,
            }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        const fieldErrors = data.errors ? Object.values(data.errors).join(', ') : ''
        throw new Error(fieldErrors || data.message || 'Failed to create report')
      }

      setSuccess('Report created successfully!')
      setForm(initialState)
      setPreview(null)
      setFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
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
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .shine-btn {
          position: relative;
          overflow: hidden;
        }
        .shine-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-120%) skewX(-15deg);
        }
        .shine-btn:hover::after {
          animation: shine 0.85s ease forwards;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header - smaller and tighter */}
        <div className="anim-rise overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-5">
          <div className="p-5 lg:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Submit a Report
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Create Report
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
              Report a lost or found item on campus. Provide as much detail as possible.
            </p>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Form - smaller padding */}
        <form
          onSubmit={handleSubmit}
          className="anim-rise overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]"
        >
          <div className="grid gap-5 p-5 md:grid-cols-2 lg:p-6">
            {/* LEFT COLUMN */}
            <div className="space-y-3.5">
              {/* Toggle - Google pill style */}
              <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                {['lost', 'found'].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => handleChange('type', t)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                      form.type === t
                        ? 'bg-emerald-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Inputs with icons - smaller */}
              <div className="relative">
                <MdTitle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  placeholder="Item Name"
                  value={form.itemName}
                  onChange={(e) => handleChange('itemName', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 placeholder:text-slate-500"
                />
              </div>

              <div className="relative">
                <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 appearance-none text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <MdColorLens className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <select
                  value={form.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 appearance-none text-white"
                >
                  <option value="">Select Color</option>
                  {colors.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <MdDescription className="absolute left-3 top-2.5 text-slate-400 text-base" />
                <textarea
                  placeholder="Description (min 10 characters)"
                  rows="3"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 resize-none placeholder:text-slate-500"
                />
              </div>

              <div className="relative">
                <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="relative">
                <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 placeholder:text-slate-500"
                />
              </div>

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImage}
                className="hidden"
              />

              {/* Image buttons - smaller */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 text-xs font-medium text-slate-200 transition"
                >
                  <MdPhotoLibrary className="text-base" />
                  Choose Photo
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 rounded-xl py-2 text-xs font-medium text-emerald-300 transition"
                >
                  <MdCameraAlt className="text-base" />
                  Take Photo
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-3.5">
              {/* Image Preview */}
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Image Preview</p>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-1.5 h-44 w-full rounded-lg object-cover border border-white/10"
                  />
                ) : (
                  <div className="mt-1.5 flex h-44 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-slate-500">
                    No image selected
                  </div>
                )}
              </div>

              {/* Summary - smaller */}
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-medium text-emerald-300 uppercase tracking-wider">Summary</p>
                <div className="mt-1.5 text-xs text-slate-200 space-y-0.5">
                  <p><span className="text-slate-400">Type:</span> {form.type}</p>
                  <p><span className="text-slate-400">Item:</span> {form.itemName || '—'}</p>
                  <p><span className="text-slate-400">Category:</span> {form.category || '—'}</p>
                  <p><span className="text-slate-400">Color:</span> {form.color || '—'}</p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="shine-btn w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  {success}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}