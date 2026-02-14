// @ts-nocheck
/**
 * UserAvatar Component
 *
 * Renders a user avatar with an optional Patreon "Friend of the Pod" badge
 * positioned at the bottom-right corner. Used everywhere an avatar is displayed.
 *
 * The `size` prop controls the avatar diameter in pixels. The patron badge
 * always renders at 1/3 of the avatar size to maintain a consistent 3:1 ratio.
 */

import './UserAvatar.css'

export interface UserAvatarProps {
  src?: string | null
  alt?: string
  className?: string
  isPatron?: boolean
  /** Avatar diameter in pixels. Badge renders at size/3 for consistent 3:1 ratio. */
  size: number
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
  size,
  fallback = 'U',
  placeholderClassName = '',
}: UserAvatarProps) {
  const badgeSize = Math.round(size / 2)
  const badgeOffset = Math.round(size * -0.15)

  return (
    <span
      className={`user-avatar-wrapper ${className}`}
      style={{ width: size, height: size }}
    >
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
          style={{
            width: badgeSize,
            height: badgeSize,
            bottom: badgeOffset,
            right: badgeOffset,
          }}
        />
      )}
    </span>
  )
}
