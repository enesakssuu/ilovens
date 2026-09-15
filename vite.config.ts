import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ilovens/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].${Date.now()}.js`,
        chunkFileNames: `assets/[name].${Date.now()}.js`,
        assetFileNames: `assets/[name].${Date.now()}[extname]`,
      },
    },
  },
})
