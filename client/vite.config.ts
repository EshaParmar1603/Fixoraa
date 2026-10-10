import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function spaPagesPlugin(): Plugin {
  return {
    name: 'spa-github-pages-fallback',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.resolve(distDir, 'index.html');
      const notFoundPath = path.resolve(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
        console.log('[spa-plugin] Created 404.html fallback for GitHub Pages');
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS || process.env.GITHUB_PAGES ? '/Fixoraa/' : '/',
  plugins: [react(), spaPagesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
