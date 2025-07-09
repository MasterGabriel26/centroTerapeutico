import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que el servidor escuche en todas las interfaces de red
    allowedHosts: [
      '1e5bf4b04089.ngrok-free.app',
      '*.ngrok-free.app', // Para futuras URLs de ngrok
      'localhost', // Asegura que localhost siga funcionando
    ],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
