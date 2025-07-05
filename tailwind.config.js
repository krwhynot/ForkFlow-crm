/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            // Custom breakpoints for responsive design
            screens: {
                xs: '480px',
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
            },
            // Color schemes for priority levels and status indicators
            colors: {
                // ForkFlow Brand Colors
                'forkflow-green': '#A6C66D',
                'forkflow-light-gray': '#F4F4F4',
                'forkflow-medium-gray': '#EDEDED',
                
                // Primary palette for consistency
                primary: {
                    50: '#f0f9ff',
                    500: '#A6C66D',
                    600: '#8BB055',
                    900: '#1e293b',
                },
                
                // Tremor color overrides
                tremor: {
                    brand: {
                        faint: '#A6C66D10',
                        muted: '#A6C66D40',
                        subtle: '#A6C66D80',
                        DEFAULT: '#A6C66D',
                        emphasis: '#8BB055',
                        inverted: '#FFFFFF',
                    },
                },
                blue: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                indigo: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                white: '#ffffff',
                success: {
                    50: '#f0fdf4',
                    500: '#22c55e',
                    700: '#15803d',
                },
                warning: {
                    50: '#fffbeb',
                    500: '#f59e0b',
                    700: '#b45309',
                },
                error: {
                    50: '#fef2f2',
                    500: '#ef4444',
                    700: '#c53030',
                },
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
                // Priority level colors
                'priority-high': '#ef4444', // red-500
                'priority-medium': '#f59e0b', // amber-500
                'priority-low': '#22c55e', // green-500
                // Status colors for organizations/deals
                'status-prospect': '#8b5cf6', // violet-500
                'status-active': '#22c55e', // green-500
                'status-inactive': '#6b7280', // gray-500
                'status-closed': '#ef4444', // red-500
            },
            // Touch target utilities for WCAG compliance
            spacing: {
                '44': '44px', // Minimum touch target
                touch: '44px', // Minimum touch target size
                'touch-sm': '36px', // Small touch target
                'touch-lg': '52px', // Large touch target
            },
            // Animation utilities for smooth transitions
            transitionProperty: {
                touch: 'all',
            },
            transitionDuration: {
                touch: '150ms',
            },
            transitionTimingFunction: {
                touch: 'ease-in-out',
            },
            fontFamily: {
                sans: [
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    '"Noto Sans"',
                    'sans-serif',
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                    '"Noto Color Emoji"',
                ],
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
            },
            fontWeight: {
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
            },
            minHeight: {
                44: '44px',
            },
            minWidth: {
                44: '44px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
    corePlugins: {
        preflight: true,
    },
};
