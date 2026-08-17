import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load properly on GitHub Pages and custom subpaths
  server: {
    port: 3000,
    open: true
  }
});
