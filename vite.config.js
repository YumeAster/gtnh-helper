import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages friendly setting.
// base: './' makes the built files use relative asset paths,
// so this works even if your repository name is not fixed.
export default defineConfig({
  plugins: [react()],
  base: './',
})
