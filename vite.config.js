import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './test/ui/setup.js',
    include: ['test/ui/**/*.test.jsx'],
    clearMocks: true,
  },
})
