import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  appType: 'spa', // Enable SPA mode - serve index.html for all routes
  plugins: [
    tailwindcss(),
    reactRouter({
      ssr: false, // Disable SSR
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    // Include dependencies that need pre-bundling
    include: [
      '@tanstack/react-query',
      'react-hot-toast',
      'zustand',
      '@supabase/supabase-js',
      'react',
      'react-dom',
      'react-router',
      'react/jsx-runtime',
    ],
    // Exclude problematic dependencies from optimization
    exclude: [],
    // Force re-optimization when dependencies change
    force: false, // Set to false to avoid constant re-optimization
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      // Increase timeout for dependency optimization
      target: 'es2020',
      jsx: 'automatic',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'global': 'globalThis',
  },
  resolve: {
    conditions: ['import', 'module', 'browser', 'default'],
    // CRITICAL: Dedupe React to prevent multiple instances
    dedupe: ['react', 'react-dom', 'react-router', 'react/jsx-runtime'],
  },
  server: {
    hmr: {
      overlay: false,
      // Fix WebSocket connection issues
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    // Increase timeouts to prevent 504 errors during dependency optimization
    fs: {
      strict: false,
    },
    // Increase timeout for dependency optimization
    warmup: {
      clientFiles: ['./app/entry.client.tsx', './app/root.tsx'],
    },
    // Prevent 504 errors by increasing timeout
    middlewareMode: false,
    // Ensure proper host binding
    host: 'localhost',
    port: 5173,
  },
  build: {
    ssr: false,
  },
});
