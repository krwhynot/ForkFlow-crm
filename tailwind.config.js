/** @type {import('tailwindcss').Config} */
module.exports = {
    content: {
        files: [
            './index.html',
            './src/**/*.{js,ts,jsx,tsx}',
            './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
        ],
        options: {
            // More aggressive purging options
            defaultExtractor: (content) => {
                return content.match(/[A-Za-z0-9-_:/]+/g) || [];
            },
            keyframes: true,
        }
    },
    // Safelist critical utilities that should never be purged
    safelist: [
        // Touch target utilities (accessibility critical)
        'touch-target-interactive',
        'min-h-44',
        'min-w-44',
        // Priority and status classes (dynamic usage)
        {
            pattern: /^(priority|status)-(high|medium|low|prospect|active|inactive|closed)$/,
        },
        // Focus states (accessibility critical)
        {
            pattern: /^focus:(outline|ring)/,
        },
        // Responsive breakpoints for commonly used utilities
        {
            pattern: /^(xs|sm|md|lg|xl|2xl):(flex|hidden|block|grid)/,
        },
        // Organization card styles
        'organization-card',
        'organization-card-mobile', 
        'organization-card-desktop',
        // Search and filter utilities
        'search-input',
        'filter-container',
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
            // Optimized color palette - removed redundant colors, kept essential ones
            colors: {
                // Core ForkFlow Brand Colors (consolidated)
                primary: {
                    50: '#f0f9ff',
                    500: '#A6C66D',
                    600: '#8BB055',
                    900: '#1e293b',
                },
                
                // Tremor integration (essential for charts)
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
                
                // Essential blue palette (most used color after gray)
                blue: {
                    500: '#3b82f6',
                    600: '#2563eb',
                },
                
                // Semantic colors (consolidated)
                success: {
                    500: '#22c55e',
                },
                warning: {
                    500: '#f59e0b',
                },
                error: {
                    500: '#ef4444',
                },
                
                // Essential gray scale (most used colors)
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
                
                // Priority colors (used in dynamic classes)
                'priority-high': '#ef4444',
                'priority-medium': '#f59e0b', 
                'priority-low': '#22c55e',
                
                // Status colors (used in dynamic classes)
                'status-prospect': '#8b5cf6',
                'status-active': '#22c55e',
                'status-inactive': '#6b7280',
                'status-closed': '#ef4444',
            },
            // Essential spacing (kept only widely used values)
            spacing: {
                '44': '44px', // WCAG minimum touch target (critical)
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
            // Simplified font system (kept only essential sizes/weights)
            fontSize: {
                sm: '0.875rem',
                base: '1rem', 
                lg: '1.125rem',
                xl: '1.25rem',
            },
            // Essential minimum sizes (WCAG compliance)
            minHeight: {
                44: '44px', // Critical for accessibility
            },
            minWidth: {
                44: '44px', // Critical for accessibility  
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
