import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter({
      ssr: false, // Disable SSR
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'global': 'globalThis',
  },
  resolve: {
    conditions: ['import', 'module', 'browser', 'default'],
    dedupe: ['react', 'react-dom', 'react-router'],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    ssr: false,
  },
});
