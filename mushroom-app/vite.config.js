// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'로 시작하는 요청을 잡아서 산림청으로 넘겨줌
      '/api': {
        target: 'http://apis.data.go.kr', 
        changeOrigin: true,
        // '/api' 글자는 지우고 보냄
        rewrite: (path) => path.replace(/^\/api/, ''), 
        secure: false,
      },
    },
  },
})