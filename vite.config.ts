import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base relativa: o mesmo build funciona no GitHub Pages e em qualquer subpasta
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  // o three.js sozinho passa de 500 kB; o aviso padrão não ajuda aqui
  build: { chunkSizeWarningLimit: 1400 },
})
