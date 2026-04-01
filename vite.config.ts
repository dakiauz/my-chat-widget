import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        define: {
            global: 'window',
            'process.env': {
                NODE_ENV: JSON.stringify(mode),
            },
        },
        plugins: [
            react(),
            cssInjectedByJsPlugin(),
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
