/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Builds straight into the static site at dist/sim/, loaded by the
// Microgravity & medicine tab as an iframe (see dist/content.js).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../dist/sim', emptyOutDir: true },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
