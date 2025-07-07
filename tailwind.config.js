/** @type {import('tailwindcss').Config} */
module.exports = {
    content: {
        files: [
            './index.html',
            './src/**/*.{js,ts,jsx,tsx}',
            './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
        ],
        options: {
            // Enhanced purging with stricter patterns
            defaultExtractor: (content) => {
                // Extract Tailwind classes more precisely
                const tailwindPattern = /[A-Za-z0-9-_:/]+/g;
                const dynamicPattern = /(priority|status)-(high|medium|low|prospect|active|inactive|closed)/g;
                const matches = [
                    ...(content.match(tailwindPattern) || []),
                    ...(content.match(dynamicPattern) || [])
                ];
                return matches;
            },
            keyframes: true,
            fontFace: false, // Disable unused font-face declarations
            variables: true, // Include CSS custom properties
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
            // Kitchen Pantry Design System - Food & CRM Inspired Palette
            colors: {
                // Primary Brand Colors - From wireframes
                primary: {
                    DEFAULT: '#2c3e50', // From wireframes
                    50: '#f7f9f5',
                    100: '#edf2e6',
                    200: '#d8e4c8',
                    300: '#b8d099',
                    400: '#9abd67',
                    500: '#2c3e50', // Updated from wireframes
                    600: '#243242',
                    700: '#1d2834',
                    800: '#161e26',
                    900: '#0f1419',
                },
                
                // Secondary - From wireframes
                secondary: {
                    DEFAULT: '#34495e', // From wireframes
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#34495e', // Updated from wireframes
                    600: '#2c3e50',
                    700: '#243242',
                    800: '#1d2834',
                    900: '#161e26',
                },
                
                // Accent - From wireframes
                accent: {
                    DEFAULT: '#3498db', // From wireframes
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3498db', // Updated from wireframes
                    600: '#2980b9',
                    700: '#2471a3',
                    800: '#1f618d',
                    900: '#1a5276',
                },
                
                // Warm Accent - Spice/Earth Tones
                warm: {
                    50: '#fef7f0',
                    100: '#feead5',
                    200: '#fed3aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316', // Warm orange (spices)
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                
                // Tremor integration (updated with new brand colors)
                tremor: {
                    brand: {
                        faint: '#7ea14210',
                        muted: '#7ea14240',
                        subtle: '#7ea14280',
                        DEFAULT: '#7ea142',
                        emphasis: '#638532',
                        inverted: '#FFFFFF',
                    },
                },
                
                // Semantic colors - Food Safety Inspired
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    500: '#22c55e', // Fresh green (safe/good)
                    600: '#16a34a',
                    700: '#15803d',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    500: '#f59e0b', // Amber (caution)
                    600: '#d97706',
                    700: '#b45309',
                },
                error: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    500: '#ef4444', // Red (danger/expired)
                    600: '#dc2626',
                    700: '#b91c1c',
                },
                
                // Enhanced gray scale (neutral tones)
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
                
                // Wireframe specific colors
                muted: '#ecf0f1',
                background: '#f5f5f5',
                foreground: '#333333',
                
                // Priority colors from wireframes (A, B, C, D)
                'priority-a': '#27ae60',         // Green - A priority
                'priority-b': '#f39c12',         // Orange - B priority  
                'priority-c': '#e67e22',         // Orange-red - C priority
                'priority-d': '#e74c3c',         // Red - D priority
                
                // Legacy priority colors (CRM specific - kept for compatibility)
                'priority-high': '#e74c3c',      // Red - urgent (mapped to priority-d)
                'priority-medium': '#f39c12',    // Orange - important (mapped to priority-b)
                'priority-low': '#27ae60',       // Green - normal (mapped to priority-a)
                'priority-critical': '#e74c3c',  // Red - critical (mapped to priority-d)
                
                // Status colors (CRM workflow)
                'status-prospect': '#8b5cf6',    // Purple - new lead
                'status-active': '#22c55e',      // Green - engaged
                'status-inactive': '#6b7280',    // Gray - dormant
                'status-closed': '#ef4444',      // Red - lost/ended
                'status-won': '#16a34a',         // Dark green - success
                'status-nurture': '#f59e0b',     // Amber - developing
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
                16: '4rem',  // 64px - Used by entity list items
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
