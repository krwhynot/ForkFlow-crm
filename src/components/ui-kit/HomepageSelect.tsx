import * as React from 'react'
import { cn } from '../../lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  touchOptimized?: boolean
}

const HomepageSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, touchOptimized = true, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Touch optimization
          touchOptimized && 'min-h-[48px] text-base',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)

HomepageSelect.displayName = 'HomepageSelect'

export { HomepageSelect }