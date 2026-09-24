import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // [FIX] En `npm run dev` (:5173) no existía proxy: api.js usa baseURL '/api'
  // (relativo), así que POST /api/token/ y /api/register/ caían en 404 del
  // servidor de Vite y las GET servían index.html. Solo funcionaba con Docker
  // (nginx.conf sí proxya). Ahora el dev server reenvía /api a Django (:8000).
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})