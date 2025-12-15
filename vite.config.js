import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // <--- METTEZ CECI (point slash) au lieu du nom du dépôt
  plugins: [
    react(),
    tailwindcss(),
  ],
})