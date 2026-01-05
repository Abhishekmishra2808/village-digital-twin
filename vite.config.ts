import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
    watch: {
      ignored: ['**/llm-app/**', '**/android/**', '**/venv/**', '**/node_modules/**', '**/.git/**'],
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    entries: ['index.html'],
  },
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
});
