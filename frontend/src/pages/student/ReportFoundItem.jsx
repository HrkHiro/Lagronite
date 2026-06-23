import { useMemo, useState } from 'react'

const initialFormState = {
  itemName: '',
  category: '',
  color: '',
  description: '',
  dateFound: '',
  locationFound: '',
  image: null,
}

const categories = ['Electronics', 'Books', 'Stationery', 'Clothing', 'Accessories', 'Documents', 'Other']
const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown', 'Other']

const initialErrors = {
  itemName: '',
  category: '',
  color: '',
  description: '',
  dateFound: '',
  locationFound: '',
  image: '',
  form: '',
}

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-sm text-rose-300">{children}</p>
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export function ReportFoundItem() {
  const [formData, setFormData] = useState(initialFormState)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errors, setErrors] = useState(initialErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const maxDate = useMemo(() => getTodayDate(), [])

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
    if (!formData.dateFound) nextErrors.dateFound = 'Select the date found'
    if (!formData.locationFound.trim()) nextErrors.locationFound = 'Location found is required'
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
    setSuccessMessage('')

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:5000/api/found-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (data?.message) {
          setErrors((current) => ({ ...current, form: data.message }))
        }
        if (data?.errors) {
          setErrors((current) => ({ ...current, ...data.errors, form: data.message || 'Submission failed' }))
        }
        return
      }

      setFormData(initialFormState)
      setPreviewUrl('')
      setErrors(initialErrors)
      setSuccessMessage(data.message || 'Found item reported successfully')
    } catch (error) {
      setErrors((current) => ({ ...current, form: error.message || 'Something went wrong' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl text-white">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 md:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-400">Student Module</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Report a Found Item</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Share the details of an item you found so the owner can be matched with it faster.
          </p>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        ) : null}

        <form className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Item Name</span>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  placeholder="e.g. iPhone Charger"
                />
                <FieldError>{errors.itemName}</FieldError>
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-300">Category</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                >
                  <option value="">Select color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                <FieldError>{errors.color}</FieldError>
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-300">Date Found</span>
                <input
                  type="date"
                  name="dateFound"
                  value={formData.dateFound}
                  max={maxDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <FieldError>{errors.dateFound}</FieldError>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Location Found</span>
              <input
                type="text"
                name="locationFound"
                value={formData.locationFound}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                placeholder="e.g. Cafeteria, Hostel Lobby"
              />
              <FieldError>{errors.locationFound}</FieldError>
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                placeholder="Describe unique marks, brand details, where you found it, or anything useful"
              />
              <FieldError>{errors.description}</FieldError>
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Upload Item Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full rounded-2xl border border-dashed border-white/15 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-sky-400"
              />
              <FieldError>{errors.image}</FieldError>
            </label>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Image Preview</h3>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Before Upload
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {previewUrl ? (
                  <img src={previewUrl} alt="Found item preview" className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-slate-400">
                    Your found item image will appear here before submission.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-sky-400/20 bg-sky-500/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Submission Tips</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                <li>• Fill every required field before submitting.</li>
                <li>• Use clear descriptions to help the owner identify it.</li>
                <li>• Image preview updates instantly before upload.</li>
                <li>• The item status is automatically set to Found.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Found Item'}
            </button>

            <FieldError>{errors.form}</FieldError>
          </aside>
        </form>
      </section>
    </div>
  )
}