import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/pbi': {
        target: 'https://powerbi-mcp-api-834462355073.us-central1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pbi/, ''),
      },
    },
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});