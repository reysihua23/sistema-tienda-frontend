// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  // 🎯 Eliminar console.log/debug/info en producción
  esbuild: {
    drop: mode === 'production' ? ['debugger'] : [],
    pure: mode === 'production'
      ? ['console.log', 'console.debug', 'console.info']
      : [],
  },

  // 🎯 Permitir acceso desde la red local (celular, tablet, etc.)
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
  },
}))