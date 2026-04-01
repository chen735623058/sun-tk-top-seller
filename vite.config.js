import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/sun-tk-top-seller/',  // 匹配GitHub Pages的仓库名
  server: {
    proxy: {
      '/api': {
        target: 'https://ark.cn-beijing.volces.com/api/coding/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
