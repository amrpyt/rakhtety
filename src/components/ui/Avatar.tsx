import React from 'react'

interface AvatarProps {
  initials: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  alt?: string
  className?: string
}

const sizeStyles = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({ initials, size = 'md', src, alt, className = '' }: AvatarProps) {
  if (src) {
    return (
      <div className={`rounded-full overflow-hidden flex-shrink-0 ${sizeStyles[size]} ${className}`}>
        <img src={src} alt={alt || initials} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full
        flex items-center justify-center
        font-bold text-white
        flex-shrink-0
        ${className}
      `.trim()}
      style={{ background: 'var(--color-primary)' }}
      title={initials}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}

interface AvatarGroupProps {
  avatars: { initials: string; src?: string }[]
  max?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className="flex items-center -space-x-reverse space-x-reverse">
      {visible.map((avatar, index) => (
        <div key={index} className="ring-2 ring-white rounded-full">
          <Avatar initials={avatar.initials} src={avatar.src} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeStyles[size]}
            rounded-full
            flex items-center justify-center
            bg-[var(--color-surface-offset)]
            text-[var(--color-text-muted)]
            font-medium
            ring-2 ring-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}