import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    // Base is intentionally left to laravel-vite-plugin, which derives it
    // from buildDirectory ('/build/'). Setting it here breaks the runtime
    // resolution of lazy-loaded page chunks. Override only via
    // VITE_BASE_PATH for a subpath deploy.
    ...(process.env.VITE_BASE_PATH ? { base: process.env.VITE_BASE_PATH } : {})
});
