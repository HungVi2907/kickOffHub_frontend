import { forwardRef } from 'react'
import Spinner from './Spinner.jsx'
import { cn } from '@/shared/utils/cn.js'

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-500 focus-visible:outline-primary-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400',
  outline: 'border border-slate-200 text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-400',
  destructive: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
}

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, isLoading = false, leftIcon, rightIcon, children, disabled, ...props },
  ref,
) {
  const isDisabled = disabled || isLoading

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="text-current" />}
      {!isLoading && leftIcon ? <span className="inline-flex items-center">{leftIcon}</span> : null}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon ? <span className="inline-flex items-center">{rightIcon}</span> : null}
    </button>
  )
})

export default Button
