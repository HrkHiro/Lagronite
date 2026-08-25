import { useState, useEffect, useRef } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { MdPhotoLibrary, MdLock, MdPerson, MdSave, MdError, MdCheckCircle } from 'react-icons/md'
import { useAuth } from '../../hooks/useAuth.js'
import { updateCurrentUser } from '../../services/profileService.js'

export function StudentSettings() {
  const { theme } = useOutletContext()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileImage, setProfileImage] = useState(user?.profileImage || '')
  const [preview, setPreview] = useState(user?.profileImage || null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    setName(user?.name || '')
    setProfileImage(user?.profileImage || '')
    setPreview(user?.profileImage || null)
  }, [user])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      setPreview(user?.profileImage || null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(selectedFile)
    setFile(selectedFile)
  }

  const readFileAsDataUrl = (fileToRead) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(fileToRead)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!name.trim()) {
        throw new Error('Name is required')
      }

      let imageData = null
      if (file) {
        imageData = await readFileAsDataUrl(file)
      }

      const payload = {
        name: name.trim(),
        profileImage: imageData || profileImage || undefined,
      }

      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const response = await updateCurrentUser(payload)
      updateUser(response.user)
      setSuccess('Profile updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setProfileImage(response.user.profileImage || profileImage)
      if (response.user.profileImage) {
        setPreview(response.user.profileImage)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        <div className={`overflow-hidden rounded-3xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-8 shadow-xl backdrop-blur-xl`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Profile Settings</p>
              <h1 className={`mt-3 text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Update your account
              </h1>
              <p className={`mt-3 max-w-2xl text-base leading-7 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Change your display name, upload a new profile image, or update your password safely.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-400"
            >
              Back to dashboard
            </button>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[320px_1fr]">
            <div className={`rounded-3xl border p-6 ${isDark ? 'border-white/10 bg-slate-950/70' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="h-32 w-32 overflow-hidden rounded-full border border-emerald-500/20 bg-slate-900/60 shadow-inner">
                    {preview ? (
                      <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-500/10 text-4xl text-emerald-300">
                        {getInitial(name || user?.name || 'S')}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 right-0 rounded-full bg-emerald-500 p-3 text-white shadow-lg transition hover:bg-emerald-400"
                    aria-label="Upload profile picture"
                  >
                    <MdPhotoLibrary className="text-xl" />
                  </button>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Upload a new profile picture. A square image works best.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={`space-y-6 rounded-3xl border p-6 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} shadow-xl`}>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

              {error && (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-100">
                  <div className="flex items-center gap-2">
                    <MdError className="text-xl" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <MdCheckCircle className="text-xl" />
                    <p>{success}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Full Name</span>
                  <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
                    <MdPerson className="mr-2 inline text-lg text-emerald-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Email</span>
                  <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-slate-950 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
                    <p className="truncate text-base">{user?.email}</p>
                  </div>
                </label>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Current Password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white placeholder:text-slate-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                    placeholder="Enter current password"
                  />
                </label>

                <label className="space-y-2">
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white placeholder:text-slate-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                    placeholder="Enter new password"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  <MdSave className="text-xl" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function getInitial(name) {
  return (name || 'User').trim().charAt(0).toUpperCase()
}
