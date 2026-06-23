import { useState } from 'react'
import { request } from '../../services/api.js'

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
  if (!children) {
    return null
  }

  return <p className="text-sm text-rose-300">{children}</p>
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

    if (!validate()) {
      return
    }

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
    <div className="mx-auto max-w-5xl text-white">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 md:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Admin Module</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Post Lost or Found Items</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">Post on behalf of students when a lost or found item needs to be recorded in the system.</p>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {message}
          </div>
        ) : null}

        <form className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Report Type</span>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              >
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Item Name</span>
                <input name="itemName" value={formData.itemName} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
                <FieldError>{errors.itemName}</FieldError>
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-300">Category</span>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400">
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
                <select name="color" value={formData.color} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400">
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
                <span className="text-sm text-slate-300">Image</span>
                <input type="file" accept="image/*" onChange={handleChange} className="w-full rounded-2xl border border-dashed border-white/15 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:font-medium file:text-slate-950" />
                <FieldError>{errors.image}</FieldError>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Description</span>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
              <FieldError>{errors.description}</FieldError>
            </label>

            {formData.type === 'lost' ? (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Date Lost</span>
                  <input type="date" name="dateLost" value={formData.dateLost} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
                  <FieldError>{errors.dateLost}</FieldError>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Location Lost</span>
                  <input name="locationLost" value={formData.locationLost} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
                  <FieldError>{errors.locationLost}</FieldError>
                </label>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Date Found</span>
                  <input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
                  <FieldError>{errors.dateFound}</FieldError>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Location Found</span>
                  <input name="locationFound" value={formData.locationFound} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400" />
                  <FieldError>{errors.locationFound}</FieldError>
                </label>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-amber-400 px-5 py-3 font-medium text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? 'Posting...' : 'Post Item'}
            </button>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Image Preview</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                {previewUrl ? <img src={previewUrl} alt="Item preview" className="h-72 w-full object-cover" /> : <div className="flex h-72 items-center justify-center text-sm text-slate-400">No image selected</div>}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5 text-sm text-slate-200">
              <p className="font-medium text-white">Admin Posting Access</p>
              <p className="mt-2 leading-6">Admins can create both lost and found reports for students. Images are uploaded to Cloudinary and stored as secure URLs in MongoDB.</p>
            </div>
          </aside>
        </form>
      </section>
    </div>
  )
}