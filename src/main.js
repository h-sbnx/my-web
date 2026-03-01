import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import request from './utils/request'
import 'normalize.css'
import '@/assets/css/base.css'

const app = createApp(App)
app.use(router).use(ElementPlus)
app.config.globalProperties.$http = request
app.mount('#app')