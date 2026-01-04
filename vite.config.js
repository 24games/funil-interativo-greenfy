import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Porta padrão
    host: true, // Permite acesso de outros dispositivos na rede
    open: true, // Abre o navegador automaticamente
    proxy: {
      // Proxy para as APIs (servidor local Express)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
