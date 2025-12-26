import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  appType: 'spa',
  plugins: [
    tailwindcss(),
    reactRouter({
      ssr: false,
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: [
      '@tanstack/react-query',
      'react-hot-toast',
      'zustand',
      'react',
      'react-dom',
      'react-router',
      'react/jsx-runtime',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
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
    dedupe: ['react', 'react-dom', 'react-router', 'react/jsx-runtime'],
  },
  server: {
    hmr: {
      overlay: false,
      protocol: 'ws',
      host: 'localhost',
      port: 19008,
    },
    fs: {
      strict: false,
    },
    host: 'localhost',
    port: 19008,
    strictPort: false,
  },
  build: {
    ssr: false,
  },
});













