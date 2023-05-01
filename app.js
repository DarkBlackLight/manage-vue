import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'

// 引入pinia，用于状态管理
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 引入路由router
import routes from '@/router/routes'
import {useAuth} from './stores/auth';

// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入element-plus全局国际化的配置
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

//全局样式文件
import './assets/styles/main.scss'
import './assets/styles/app.scss'

// 引入App.vue，根组件
import App from './App.vue'

const router = createRouter({
    history: createWebHistory(), routes: routes
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

const app = createApp(App)

app.use(pinia)

app.use(router)

app.use(ElementPlus, {
    locale: zhCn,
})

app.mount('#app')


