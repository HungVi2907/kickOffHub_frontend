import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn.js'

const Input = forwardRef(function Input(
  { label, error, description, className, inputClassName, required, hiddenLabel = false, ...props },
  ref,
) {
  const inputId = props.id || props.name

  return (
    <label className={cn('flex w-full flex-col gap-1 text-sm', className)} htmlFor={inputId}>
      {!hiddenLabel && label ? (
        <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      ) : null}
      <input
        ref={ref}
        {...props}
        id={inputId}
        required={required}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : null,
          inputClassName,
        )}
      />
      {description && <span className="text-xs text-slate-500">{description}</span>}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </label>
  )
})

export default Input
