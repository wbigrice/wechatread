import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://i.weread.qq.com',
        changeOrigin: true,
        rewrite: () => '/api/agent/gateway'
      }
    }
  }
})
