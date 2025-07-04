import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    css: {
        postcss: './postcss.config.cjs',
    },
    build: {
        sourcemap: true,
        target: 'es2015',
        reportCompressedSize: false,
        chunkSizeWarningLimit: 800,
        commonjsOptions: {
            include: ['tailwind.config.js', 'node_modules/**'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // Development server optimizations
    server: {
        hmr: {
            overlay: false, // Disable error overlay for better UX
        },
        fs: {
            // Improve file watching performance
            strict: false,
        },
    },
    // Dependency pre-bundling optimizations
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-admin',
            'ra-supabase',
            '@supabase/supabase-js',
            '@tanstack/react-query',
            '@headlessui/react',
            '@heroicons/react/24/outline',
            '@heroicons/react/24/solid',
            '@tremor/react',
        ],
        // force: true, // Force re-optimization of dependencies
    },
    // Improve build performance
    esbuild: {
        // Use esbuild for faster transpilation
        target: 'es2015',
        drop:
            process.env.NODE_ENV === 'production'
                ? ['console', 'debugger']
                : [],
    },
});
