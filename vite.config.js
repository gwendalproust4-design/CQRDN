import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/CQRDN/', // GitHub Pages repo path (https://gwendalproust4-design.github.io/CQRDN/)
  plugins: [
    react(),
    tailwindcss(),
  ],
})
