import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)

// 引入pinia，用于状态管理
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

// 引入路由router
import routes from '@/router/routes'
import {useAuth} from './stores/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), routes: routes
})


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

app.use(router)

// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入element-plus全局国际化的配置
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

app.use(ElementPlus, {
    locale: zhCn,
})

//全局样式文件
import '@/assets/css/main.scss'
import '@/assets/css/app.scss'

// 引入App.vue，根组件
import App from '@/App.vue'

app.mount('#app')
