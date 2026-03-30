import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react(),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: mode === 'widget' ? {
            lib: {
                entry: path.resolve(__dirname, 'src/widget-entry.tsx'),
                name: 'DakiaWidget',
                fileName: (format) => `widget.${format}.js`,
                formats: ['iife'], // Compile to a single Immediately Invoked Function Expression
            },
            rollupOptions: {
                // Externalize nothing - bundle everything into one file
                external: [],
                output: {
                    // Force a single file output
                    inlineDynamicImports: true,
                },
            },
            emptyOutDir: false, // Don't wipe dist used by main app
            outDir: 'dist-widget',
        } : {
            outDir: 'dist',
        },
    };
});
