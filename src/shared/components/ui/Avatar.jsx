import { forwardRef, useState } from 'react'
import { cn } from '@/shared/utils/cn.js'
import { withFallback } from '@/shared/utils/img.js'

const Avatar = forwardRef(function Avatar({ src, alt = 'Avatar', size = 'md', className, fallback }, ref) {
  const [error, setError] = useState(false)
  const dimension = {
    xs: 'h-8 w-8',
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const resolvedSrc = error ? fallback : withFallback(src, fallback)

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      className={cn('rounded-full object-cover', dimension[size] || dimension.md, className)}
      loading="lazy"
      onError={() => setError(true)}
    />
  )
})

export default Avatar
