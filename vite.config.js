import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { bunny } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Quicksand', { weights: [400, 500, 600, 700] }),
                bunny('Plus Jakarta Sans', { weights: [400, 500, 600, 700] }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
});
