import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/dashboard/',
  build: {
    outDir: '../server/public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:7474',
      '/health': 'http://localhost:7474',
    },
  },
});
