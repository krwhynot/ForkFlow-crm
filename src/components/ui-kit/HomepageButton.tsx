import * as React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  touchOptimized?: boolean
}

const HomepageButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', touchOptimized = true, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          // Touch optimization - minimum 48px height per WCAG guidelines
          touchOptimized && 'min-h-[48px] min-w-[48px]',
          // Variants
          variant === 'default' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
          variant === 'ghost' && 'hover:bg-gray-100',
          // Sizes
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'md' && 'h-10 px-4 py-2',
          size === 'lg' && 'h-12 px-6 text-lg',
          // Override size if touch optimized
          touchOptimized && size === 'md' && 'h-12 px-4 py-2',
          touchOptimized && size === 'lg' && 'h-14 px-6 text-lg',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

HomepageButton.displayName = 'HomepageButton'

export { HomepageButton }