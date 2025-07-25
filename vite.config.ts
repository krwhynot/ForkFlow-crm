import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    css: {
        postcss: './postcss.config.js',
    },
    build: {
        sourcemap: true,
        target: 'es2015',
        reportCompressedSize: false,
        chunkSizeWarningLimit: 800,
    },
});
