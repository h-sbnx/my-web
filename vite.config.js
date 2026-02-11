import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [vue()],
  //为避免发送至github时样式图片丢失
  base: process.env.NODE_ENV === 'production' ? '/my-web/' : '/' ,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: [
            'last 2 versions',
            '> 1%',
            'iOS >= 9',
            'Android >= 6'
          ]
        })
      ]
    }
  },
  assetsInclude: ['**/*.doc', '**/*.docx']
})