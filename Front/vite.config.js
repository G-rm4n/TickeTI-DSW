import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTest.ts'],
    include: ['tests/**/*.test.{js,jsx,ts,tsx}'],
    env: {
    VITE_API_URL: 'http://localhost:3000/api',
  },
  },
});