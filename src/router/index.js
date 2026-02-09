import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') }, // 首页
        { path: '/notice', name: 'Notice', component: () => import('@/views/NoticeView.vue') }, // 赛事通知
        { path: '/apply', name: 'Apply', component: () => import('@/views/ApplyView.vue') }, // 报名入口
        { path: '/upload', name: 'Upload', component: () => import('@/views/UploadView.vue') }, // 作品提交
        { path: '/public', name: 'Public', component: () => import('@/views/PublicView.vue') }, // 赛事公示
        { path: '/about', name: 'About', component: () => import('@/views/AboutView.vue') }, // 关于大赛
        { path: '/contact', name: 'Contact', component: () => import('@/views/ContactView.vue') },// 联系方式
        { path: '/templates', name: 'Templates', component: () => import('@/views/TemplateDownloadView.vue') } //模板下载
    ]
})
export default router