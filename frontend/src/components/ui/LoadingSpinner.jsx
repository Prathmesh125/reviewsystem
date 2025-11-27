import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  children 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    gray: 'text-gray-600',
  }

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <Loader2 
        className={clsx(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
      {children && (
        <span className="ml-2 text-sm text-gray-600">
          {children}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner