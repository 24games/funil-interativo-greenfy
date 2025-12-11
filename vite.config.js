import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: false
  },
  // Configuração para SPA - redireciona todas as rotas para index.html
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})








