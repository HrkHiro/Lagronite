import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import Webcam from 'react-webcam'
import {
  MdPhotoLibrary,
  MdCameraAlt,
  MdDescription,
  MdLocationOn,
  MdCalendarToday,
  MdColorLens,
  MdCategory,
  MdTitle,
  MdSend,
  MdError,
  MdCheckCircle,
} from 'react-icons/md'

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
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { theme } = useOutletContext() // Get theme from layout

  const isDark = theme === 'dark'

  const fileInputRef = useRef(null)
  const webcamRef = useRef(null)

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
      const result = String(reader.result || '')
      setPreview(result)
      handleChange('image', result)
      setCameraActive(false)
    }
    reader.readAsDataURL(selectedFile)
    setFile(selectedFile)
  }

  const handleCapture = () => {
    const screenshot = webcamRef.current?.getScreenshot()
    if (!screenshot) {
      setError('Unable to capture photo. Please allow camera access.')
      return
    }

    setPreview(screenshot)
    handleChange('image', screenshot)
    setCameraActive(false)
    setFile(null)
    setError('')
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
    if (!form.image) {
      setError('Please select or take an image')
      setLoading(false)
      return
    }

    try {
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
              image: form.image,
            }
          : {
              itemName: form.itemName,
              category: form.category,
              color: form.color,
              description: form.description,
              dateFound: form.date,
              locationFound: form.location,
              image: form.image,
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
    <section className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Header - INCREASED padding and fonts */}
        <div className={`anim-rise overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg mb-8`}>
          <div className="p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Submit a Report
            </p>
            <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Report
            </h1>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Report a lost or found item on campus. Provide as much detail as possible.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Form - INCREASED padding */}
        <form
          onSubmit={handleSubmit}
          className={`anim-rise overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-xl`}
        >
          <div className="grid gap-6 p-8 md:grid-cols-2 lg:p-10">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              {/* Toggle - LARGER pill style */}
              <div className={`flex gap-2 p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                {['lost', 'found'].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => handleChange('type', t)}
                    className={`flex-1 py-3 text-base font-semibold rounded-lg transition-all duration-200 ${
                      form.type === t
                        ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-400'
                        : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Inputs with icons - LARGER */}
              <div className="relative">
                <MdTitle className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <input
                  placeholder="Item Name"
                  value={form.itemName}
                  onChange={(e) => handleChange('itemName', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-slate-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div className="relative">
                <MdCategory className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full pl-12 pr-10 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 appearance-none cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className={isDark ? 'bg-slate-900' : 'bg-white'}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <MdColorLens className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <select
                  value={form.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className={`w-full pl-12 pr-10 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 appearance-none cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>
                    Select Color
                  </option>
                  {colors.map((col) => (
                    <option key={col} value={col} className={isDark ? 'bg-slate-900' : 'bg-white'}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <MdDescription className={`absolute left-4 top-3 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <textarea
                  placeholder="Description (min 10 characters)"
                  rows="4"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 resize-none ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-slate-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div className="relative">
                <MdCalendarToday className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 [color-scheme:dark]'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                  }`}
                />
              </div>

              <div className="relative">
                <MdLocationOn className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-slate-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-gray-400'
                  }`}
                />
              </div>

              {/* Hidden input for local file fallback */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />

              {/* Camera Preview */}
              {cameraActive && (
                <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'} p-5 backdrop-blur-sm`}> 
                  <p className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Camera Preview
                  </p>
                  <Webcam
                    audio={false}
                    mirrored={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'environment' }}
                    className="mt-4 h-72 w-full rounded-xl bg-black object-cover"
                  />
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="flex-1 rounded-xl bg-emerald-500 py-3.5 text-base font-medium text-white transition-all duration-200 hover:bg-emerald-400"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraActive(false)}
                      className={`flex-1 rounded-xl border py-3.5 text-base font-medium transition-all duration-200 ${
                        isDark
                          ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Image buttons - LARGER */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl border py-3.5 text-base font-medium transition-all duration-200 ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                  }`}
                >
                  <MdPhotoLibrary className="text-2xl" />
                  Choose Photo
                </button>
                <button
                  type="button"
                  onClick={() => setCameraActive(true)}
                  className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl border py-3.5 text-base font-medium transition-all duration-200 ${
                    isDark
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-400/20 text-emerald-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-400/30 text-emerald-700'
                  }`}
                >
                  <MdCameraAlt className="text-2xl" />
                  Take Photo
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              {/* Image Preview - LARGER */}
              <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'} p-5 backdrop-blur-sm`}>
                <p className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Image Preview
                </p>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className={`mt-2 h-56 w-full rounded-lg object-cover border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                  />
                ) : (
                  <div className={`mt-2 flex h-56 items-center justify-center rounded-lg border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-gray-300 text-gray-400'} text-base`}>
                    No image selected
                  </div>
                )}
              </div>

              {/* Summary - LARGER */}
              <div className={`rounded-xl border ${isDark ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-emerald-400/30 bg-emerald-50'} p-5`}>
                <p className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  Summary
                </p>
                <div className={`mt-2 text-base space-y-1.5 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  <p className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Type:</span>
                    <span className="font-medium capitalize">{form.type}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Item:</span>
                    <span className="font-medium">{form.itemName || '—'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Category:</span>
                    <span className="font-medium">{form.category || '—'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Color:</span>
                    <span className="font-medium">{form.color || '—'}</span>
                  </p>
                </div>
              </div>

              {/* Submit Button - LARGER */}
              <button
                type="submit"
                disabled={loading}
                className="shine-btn w-full rounded-xl bg-emerald-500 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MdSend className="text-2xl" />
                    Submit Report
                  </>
                )}
              </button>

              {/* Error Message - LARGER */}
              {error && (
                <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10' : 'border-rose-400/30 bg-rose-50'} px-5 py-4 flex items-start gap-3`}>
                  <MdError className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
                  <p className={`text-base font-medium ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                    {error}
                  </p>
                </div>
              )}

              {/* Success Message - LARGER */}
              {success && (
                <div className={`rounded-xl border ${isDark ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-400/30 bg-emerald-50'} px-5 py-4 flex items-start gap-3`}>
                  <MdCheckCircle className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                  <p className={`text-base font-medium ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    {success}
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}