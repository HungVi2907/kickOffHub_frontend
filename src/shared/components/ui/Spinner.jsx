import { cn } from '@/shared/utils/cn.js'

export default function Spinner({ className, size = 'md' }) {
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-current',
        sizeMap[size] || sizeMap.md,
        className,
      )}
      role="presentation"
    />
  )
}
