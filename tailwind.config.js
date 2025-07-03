/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom breakpoints for responsive design
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Color schemes for priority levels and status indicators
      colors: {
        priority: {
          high: '#ef4444',    // red-500
          medium: '#f59e0b',  // amber-500
          low: '#10b981',     // emerald-500
        },
        status: {
          prospect: '#6366f1',   // indigo-500
          active: '#10b981',     // emerald-500
          inactive: '#6b7280',   // gray-500
          closed: '#ef4444',     // red-500
        },
        business: {
          restaurant: '#f59e0b', // amber-500
          grocery: '#10b981',    // emerald-500
          distributor: '#8b5cf6', // violet-500
          other: '#6b7280',      // gray-500
        }
      },
      // Touch target utilities for WCAG compliance
      spacing: {
        'touch': '44px',      // Minimum touch target size
        'touch-sm': '36px',   // Small touch target
        'touch-lg': '52px',   // Large touch target
      },
      // Enhanced focus ring utilities for accessibility
      ringWidth: {
        'focus': '2px',
      },
      ringOffsetWidth: {
        'focus': '2px',
      },
      // Animation utilities for smooth transitions
      transitionProperty: {
        'touch': 'all',
      },
      transitionDuration: {
        'touch': '150ms',
      },
      transitionTimingFunction: {
        'touch': 'ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for touch target utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-sm': {
          minHeight: '36px',
          minWidth: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-lg': {
          minHeight: '52px',
          minWidth: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            ringWidth: '2px',
            ringColor: '#3b82f6', // blue-500
            ringOffsetWidth: '2px',
            ringOffsetColor: '#ffffff',
          },
        },
        '.touch-feedback': {
          transition: 'all 150ms ease-in-out',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
  // Ensure compatibility with Material-UI
  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset to avoid conflicts with MUI
  },
}