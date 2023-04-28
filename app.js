import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import routes from '@/router/routes'

// 引入pinia，用于状态管理
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 引入路由router
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), routes: routes
})

import {useAuth} from './stores/auth';

router.beforeEach(async (to, from, next) => {
    const authStore = useAuth()
    const publicPages = ['/login', '/register']
    const authRequired = !publicPages.includes(to.path)
    const loggedIn = await authStore.current();

    if (authRequired && !loggedIn) {
        next('/login')
    } else if (!authRequired && loggedIn) {
        next('/')
    } else {
        next()
    }
})

// 引入App.vue，根组件
import App from '@/App.vue'

// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入element-plus全局国际化的配置
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

//全局样式文件
import '@/assets/css/main.scss'
import '@/assets/css/app.scss'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
})
app.use(pinia)
app.mount('#app')
