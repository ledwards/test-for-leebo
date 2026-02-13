// @ts-nocheck
/**
 * UserAvatar Component
 *
 * Renders a user avatar with an optional Patreon "Friend of the Pod" badge
 * positioned at the bottom-right corner. Used everywhere an avatar is displayed.
 */

import './UserAvatar.css'

export interface UserAvatarProps {
  src?: string | null
  alt?: string
  className?: string
  isPatron?: boolean
  /** Fallback letter when no avatar image (first char of username) */
  fallback?: string
  /** Additional class for the placeholder style */
  placeholderClassName?: string
}

export default function UserAvatar({
  src,
  alt = 'User',
  className = '',
  isPatron = false,
  fallback = 'U',
  placeholderClassName = '',
}: UserAvatarProps) {
  return (
    <span className={`user-avatar-wrapper ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="user-avatar-img" />
      ) : (
        <span className={`user-avatar-placeholder ${placeholderClassName}`}>
          {fallback}
        </span>
      )}
      {isPatron && (
        <img
          src="/patreon/friendofthepod.png"
          alt="Patreon supporter"
          className="user-avatar-patron-badge"
        />
      )}
    </span>
  )
}
