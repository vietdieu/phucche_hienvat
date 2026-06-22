import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'next/image': path.resolve(__dirname, './src/mock/next-image.tsx'),
      'next/navigation': path.resolve(__dirname, './src/mock/next-navigation.tsx'),
      'next/link': path.resolve(__dirname, './src/mock/next-link.tsx'),
      '@': path.resolve(__dirname, './src'),
      '@/src': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});