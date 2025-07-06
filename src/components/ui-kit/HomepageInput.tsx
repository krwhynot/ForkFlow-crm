import * as React from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  touchOptimized?: boolean
}

const HomepageInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, touchOptimized = true, ...props }, ref) => {
    return (
      <input
        className={cn(
          'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Touch optimization - minimum 48px height
          touchOptimized && 'min-h-[48px] text-base',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

HomepageInput.displayName = 'HomepageInput'

export { HomepageInput }