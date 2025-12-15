import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Relative base works on any subpath including GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
  ],
})
