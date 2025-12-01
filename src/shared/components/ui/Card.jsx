import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn.js'

const Card = forwardRef(function Card({ className, children, as: Component = 'article', ...props }, ref) {
  return (
    <Component
      ref={ref}
      className={cn('rounded-2xl border border-slate-100 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </Component>
  )
})

export const CardHeader = ({ className, children }) => (
  <div className={cn('border-b border-slate-100 px-6 py-4', className)}>{children}</div>
)

export const CardTitle = ({ className, children }) => (
  <h3 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h3>
)

export const CardDescription = ({ className, children }) => (
  <p className={cn('text-sm text-slate-500', className)}>{children}</p>
)

export const CardContent = ({ className, children }) => (
  <div className={cn('px-6 py-4 text-sm text-slate-700', className)}>{children}</div>
)

export const CardFooter = ({ className, children }) => (
  <div className={cn('flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4', className)}>
    {children}
  </div>
)

export default Card
