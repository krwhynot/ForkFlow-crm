import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            open: process.env.NODE_ENV !== 'CI',
            filename: './dist/stats.html',
        }),
        dts({ include: ['.'], entryRoot: '.', outDir: '../lib/types' }),
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    build: {
        sourcemap: true,
        outDir: '../lib',

        emptyOutDir: true,
        lib: {
            entry: './index.tsx',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
    },
    resolve: {
        preserveSymlinks: true,
    },
    root: './src',
});
