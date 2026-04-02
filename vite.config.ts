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
            process: {
                env: {
                    NODE_ENV: JSON.stringify(mode),
                },
                browser: true,
            },
            global: 'window',
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
                output: {
                    entryFileNames: `[name].iife.js`,
                    chunkFileNames: `[name].iife.js`,
                    assetFileNames: `[name].[ext]`,
                    format: 'iife',
                    name: 'DakiaWidget',
                    banner: "window.process = window.process || { env: { NODE_ENV: 'production' }, browser: true }; window.global = window.global || window;",
                },
            },
            emptyOutDir: false, // Don't wipe dist used by main app
            outDir: 'dist-widget',
        } : {
            outDir: 'dist',
        },
    };
});
