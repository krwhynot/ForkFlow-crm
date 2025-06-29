import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';
import type { ManualChunksOption } from 'rollup';

const alias = [
    {
        find: 'react-admin',
        replacement: path.resolve(__dirname, './node_modules/react-admin/src'),
    },
    {
        find: 'ra-core',
        replacement: path.resolve(__dirname, './node_modules/ra-core/src'),
    },
    {
        find: 'ra-i18n-polyglot',
        replacement: path.resolve(
            __dirname,
            './node_modules/ra-i18n-polyglot/src'
        ),
    },
    {
        find: 'ra-language-english',
        replacement: path.resolve(
            __dirname,
            './node_modules/ra-language-english/src'
        ),
    },
    {
        find: 'ra-ui-materialui',
        replacement: path.resolve(
            __dirname,
            './node_modules/ra-ui-materialui/src'
        ),
    },
    {
        find: 'ra-data-fakerest',
        replacement: path.resolve(
            __dirname,
            './node_modules/ra-data-fakerest/src'
        ),
    },
    {
        find: 'ra-supabase-core',
        replacement: path.resolve(
            __dirname,
            './node_modules/ra-supabase-core/src'
        ),
    },
    {
        find: 'ra-supabase-ui-materialui',
        replacement: path.resolve(
            __dirname,
            './node_modules/ra-supabase-ui-materialui/src'
        ),
    },
    {
        find: 'ra-supabase-language-english',
        replacement: path.resolve(
            __dirname,
            './node_modules/ra-supabase-language-english/src'
        ),
    },
    {
        find: 'ra-supabase',
        replacement: path.resolve(__dirname, './node_modules/ra-supabase/src'),
    },
    // add any other react-admin packages you have
];

// Manual chunk splitting configuration for optimal bundle size
const manualChunks: ManualChunksOption = (id: string) => {
    // Vendor chunk for core React libraries
    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
        return 'react-vendor';
    }

    // Material-UI chunk
    if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
        return 'mui-vendor';
    }

    // React-Admin framework chunk
    if (id.includes('node_modules/ra-') || id.includes('react-admin')) {
        return 'react-admin-vendor';
    }

    // Supabase chunk
    if (id.includes('node_modules/@supabase') || id.includes('supabase')) {
        return 'supabase-vendor';
    }

    // Charts and visualization chunk
    if (id.includes('node_modules/@nivo') || 
        id.includes('node_modules/d3') || 
        id.includes('node_modules/recharts')) {
        return 'charts-vendor';
    }

    // Google Maps chunk
    if (id.includes('node_modules/@googlemaps') || 
        id.includes('node_modules/@react-google-maps')) {
        return 'maps-vendor';
    }

    // Date handling chunk
    if (id.includes('node_modules/date-fns') || 
        id.includes('node_modules/dayjs') ||
        id.includes('node_modules/moment')) {
        return 'date-vendor';
    }

    // Utilities chunk
    if (id.includes('node_modules/lodash') || 
        id.includes('node_modules/ramda') ||
        id.includes('node_modules/uuid') ||
        id.includes('node_modules/classnames')) {
        return 'utils-vendor';
    }

    // Form handling chunk
    if (id.includes('node_modules/react-hook-form') || 
        id.includes('node_modules/formik') ||
        id.includes('node_modules/yup')) {
        return 'forms-vendor';
    }

    // Other vendor libraries
    if (id.includes('node_modules/')) {
        return 'vendor';
    }

    // Application chunks based on directory structure
    if (id.includes('/src/dashboard/')) {
        return 'dashboard';
    }

    if (id.includes('/src/products/')) {
        return 'products';
    }

    if (id.includes('/src/organizations/')) {
        return 'organizations';
    }

    if (id.includes('/src/opportunities/')) {
        return 'opportunities';
    }

    if (id.includes('/src/interactions/')) {
        return 'interactions';
    }

    if (id.includes('/src/deals/')) {
        return 'deals';
    }

    // Default chunk for other application code
    return undefined;
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            open: process.env.NODE_ENV !== 'CI',
            filename: './dist/stats.html',
        }),
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    base: './',
    esbuild: {
        keepNames: true,
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks,
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId
                        ? chunkInfo.facadeModuleId.split('/').pop()
                        : 'chunk';
                    return `js/[name]-[hash].js`;
                },
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name!.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name!)) {
                        return `images/[name]-[hash][extname]`;
                    }
                    if (/\.(css)$/i.test(assetInfo.name!)) {
                        return `css/[name]-[hash][extname]`;
                    }
                    return `assets/[name]-[hash][extname]`;
                },
            },
        },
        target: 'es2015',
        minify: 'esbuild',
        cssMinify: true,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 800,
    },
    resolve: {
        alias,
        preserveSymlinks: true,
    },
});
