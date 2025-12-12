import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: false,
    // Garante que arquivos estáticos sejam servidos corretamente
    fs: {
      strict: false
    }
  },
  // Configuração para SPA - redireciona todas as rotas para index.html
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // Garante que arquivos estáticos sejam copiados corretamente
    assetsInclude: ['**/*.webp', '**/*.jpg', '**/*.jpeg', '**/*.png']
  },
  // Garante que a pasta public seja servida corretamente
  publicDir: 'public'
})








