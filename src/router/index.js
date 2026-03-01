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
            meta: { requireAuth: true }
        },
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('adminToken')

    if (to.meta.requireAuth) {
        if (!token) {
            ElMessage.warning('请先登录管理员账号！')
            next({ path: '/login', replace: true })
            return
        } else {
            next()
        }
    }
    else if (to.path === '/login' && token) {
        next({ path: '/admin', replace: true })
    }
    else {
        next()
    }
})

export default router