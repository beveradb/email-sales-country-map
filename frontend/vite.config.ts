import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
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
    // Optimize for slow connections
    minify: true,
    // Ensure source maps for better debugging in dev
    sourcemap: false, // Disable in production to reduce size
    // Add build verification
    reportCompressedSize: true,
    // Set smaller chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
  // Ensure proper module resolution
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
})
