import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  assetsInclude: ['**/*.doc', '**/*.docx']
})
//为避免发送至github时样式图片丢失
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
      ? '/my-web/'
      : '/' }