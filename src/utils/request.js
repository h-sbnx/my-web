import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截
request.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, error => {
    ElMessage.error('请求发送失败')
    return Promise.reject(error)
})

// 响应拦截
request.interceptors.response.use(
    res => {
        return res.data
    },
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
            ElMessage.warning('登录已过期，请重新登录')
            if (router.currentRoute.path !== '/login') {
                router.replace('/login')
            }
        } else if (error.response?.status === 404) {
            ElMessage.error(`接口不存在：${error.response.config.url}`)
        } else {
            ElMessage.error(error.response?.data?.message || '请求失败')
        }
        return Promise.reject(error)
    }
)

export default request