import { createApp } from 'vue' //导入creatApp方法
import App from './App.vue'
import router from './router' //导入路由实例
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' //导入elementplus样式文件
import request from './utils/request' //导入axios实例
import 'normalize.css'//引入normalize.css，统一浏览器样式
import '@/assets/css/base.css' //引入基础样式

const app = createApp(App)
app.use(router).use(ElementPlus) //注册路由和UI组件的插件
app.config.globalProperties.$http = request // 全局挂载axios
app.mount('#app')