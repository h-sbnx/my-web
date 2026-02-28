import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
        { path: '/notice', name: 'Notice', component: () => import('@/views/NoticeView.vue') },
        { path: '/apply', name: 'Apply', component: () => import('@/views/ApplyView.vue') },
        { path: '/upload', name: 'Upload', component: () => import('@/views/UploadView.vue') },
        { path: '/public', name: 'Public', component: () => import('@/views/PublicView.vue') },
        { path: '/about', name: 'About', component: () => import('@/views/AboutView.vue') },
        { path: '/contact', name: 'Contact', component: () => import('@/views/ContactView.vue') },
        { path: '/templates', name: 'Templates', component: () => import('@/views/TemplateDownloadView.vue') },
        { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
        {
            path: '/admin',
            name: 'Admin',
            component: () => import('@/views/Admin.vue'),
            meta: { requireAuth: true } // 标记需要鉴权
        },
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ]
})

// 全局路由守卫：严格鉴权
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('adminToken')

    // 1. 访问需要鉴权的页面（/admin）
    if (to.meta.requireAuth) {
        if (!token) {
            // 无Token：提示 + 强制跳登录页，阻止后续代码执行
            ElMessage.warning('请先登录管理员账号！')
            next({ path: '/login', replace: true })
            return // 必须 return，否则会继续执行
        } else {
            // 有Token：放行
            next()
        }
    }
    // 2. 已登录状态下访问登录页：跳转到后台
    else if (to.path === '/login' && token) {
        next({ path: '/admin', replace: true })
    }
    // 3. 其他页面正常放行
    else {
        next()
    }
})

export default router