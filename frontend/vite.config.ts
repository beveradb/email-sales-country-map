import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          maps: ['react-simple-maps', 'd3-scale', 'd3-geo'],
        },
      },
    },
    // Ensure source maps for better debugging
    sourcemap: true,
    // Add build verification
    reportCompressedSize: true,
  },
  // Ensure proper module resolution
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
})
