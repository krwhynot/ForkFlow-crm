/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
const dirname =
    typeof __dirname !== 'undefined'
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    resolve: {
        alias: {
            '@': path.join(dirname, 'src'),
        },
    },
    test: {
        setupFiles: ['./setupFiles/jest.ts'],
        globals: true,
        environment: 'happy-dom',
    },
});
