import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter({
      ssr: true,
    }),
    tsconfigPaths(),
  ],
  ssr: {
    // Bundle all dependencies for SSR to avoid CommonJS/ESM conflicts
    noExternal: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Polyfill for CommonJS modules
    'global': 'globalThis',
  },
});
