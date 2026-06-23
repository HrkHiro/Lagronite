import { useState } from 'react'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
      handleChange('image', reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // VALIDATION
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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-white">

      {/* HEADER */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-3xl font-semibold">Create Report</h2>
        <p className="mt-2 text-slate-300">
          Report a lost or found item in campus
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-2"
      >

        {/* LEFT SIDE */}
        <div className="space-y-4">

          {/* TYPE */}
          <div className="flex gap-3">
            {['lost', 'found'].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => handleChange('type', t)}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm ${
                  form.type === t
                    ? 'bg-emerald-500 text-slate-950'
                    : 'border-white/10 text-slate-300'
                }`}
              >
                {t.toUpperCase()} ITEM
              </button>
            ))}
          </div>

          {/* ITEM NAME */}
          <input
            placeholder="Item Name"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
            value={form.itemName}
            onChange={(e) => handleChange('itemName', e.target.value)}
          />

          {/* CATEGORY (FIXED) */}
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* COLOR (FIXED) */}
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
            value={form.color}
            onChange={(e) => handleChange('color', e.target.value)}
          >
            <option value="">Select Color</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description (min 10 characters)"
            rows="4"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          {/* DATE */}
          <input
            type="date"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />

          {/* LOCATION */}
          <input
            placeholder="Location"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />

          {/* IMAGE */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">

          {/* PREVIEW */}
          <div className="rounded-3xl border border-white/10 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Preview</p>

            {preview ? (
              <img
                src={preview}
                className="mt-3 h-64 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="mt-3 flex h-64 items-center justify-center text-slate-500">
                No image selected
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm">
            <p className="font-medium text-white">Report Preview</p>
            <p>Type: {form.type}</p>
            <p>Item: {form.itemName || '-'}</p>
            <p>Category: {form.category || '-'}</p>
            <p>Color: {form.color || '-'}</p>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 py-3 font-medium text-slate-950 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>

          {/* FEEDBACK */}
          {error && <p className="text-rose-300">{error}</p>}
          {success && <p className="text-emerald-300">{success}</p>}
        </div>
      </form>
    </div>
  )
}
