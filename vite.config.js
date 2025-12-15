import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Relative base ensures the built app can be served from any static host
  plugins: [
    react(),
    tailwindcss(),
  ],
})
