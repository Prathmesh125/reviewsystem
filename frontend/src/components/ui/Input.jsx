import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(({
  label,
  error,
  hint,
  className = '',
  required = false,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        className={clsx(
          'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 shadow-sm transition-colors',
          'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
          className
        )}
        {...props}
      />
      
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-error-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input