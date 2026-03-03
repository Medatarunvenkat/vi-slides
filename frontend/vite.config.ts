import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    server: {
        port: 5173,
        open: true,
        host: true,        // Expose to network
        allowedHosts: ['wilbur-unabused-unsymphoniously.ngrok-free.dev', 'localhost', '127.0.0.1'],
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:5001',
                ws: true,
                changeOrigin: true,
            }
        }
    }
})