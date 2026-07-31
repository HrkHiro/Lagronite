import React from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'

export default function ImageWithPrivacy({ src, alt = '', ownerId = null, className = '' }) {
  const { user, role } = useAuthContext()
  const isOwner = user && (user.id === ownerId || user._id === ownerId)
  const isAdmin = role === 'admin'

  const shouldBlur = !isAdmin && !isOwner

  return (
    <div className="relative overflow-hidden">
      <img
        src={src}
        alt={alt}
        className={`${className} transition duration-500 ${shouldBlur ? 'filter blur-sm grayscale' : ''}`}
      />
      {shouldBlur && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-md bg-black/40 px-3 py-1 text-sm text-white backdrop-blur-sm">Blurred for privacy</div>
        </div>
      )}
    </div>
  )
}
