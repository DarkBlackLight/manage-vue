import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'

// 引入pinia，用于状态管理
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 引入路由router
import routes from '@/configs/routes'
import {useAuth} from './stores/auth';

// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入国际化语言设置
import {createI18n} from 'vue-i18n'
import translations from './utils/i18n'

// 引入element-plus全局国际化的配置
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

//全局样式文件
import './assets/styles/main.scss'
import './assets/styles/app.scss'

// 引入App.vue，根组件
import App from './App.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), routes: [
        ...[
            {
                path: '/login',
                name: 'login',
                component: () => import('@/manage-vue/layouts/LoginLayout.vue')
            }
        ]
    ]
})

const filterRouter = (rs, permissions) => rs
    .filter(r => !r.permission || r.permission(permissions))
    .map(r => r.children ? ({...r, children: filterRouter(r.children, permissions)}) : r)

router.beforeEach(async (to, from, next) => {
    const authStore = useAuth()
    const publicPages = ['/login', '/register']
    const authRequired = !publicPages.includes(to.path)
    const loggedIn = await authStore.current();

    if (authRequired && !loggedIn) {
        next('/login')
        return
    }

    if (!authStore.globalState.routerInit) {
        filterRouter(routes, authStore.permissions).forEach(r => router.addRoute(r));

        authStore.changeGlobalState('routerInit', true);
        await router.replace(router.currentRoute.value.fullPath);
    }

    if (!authRequired && loggedIn) {
        next('/')
    } else {
        next()
    }
})

const i18n = createI18n({
    locale: import.meta.env.VITE_DEFAULT_LOCALE,
    fallbackLocale: 'zh',
    legacy: false,
    messages: translations
})

const app = createApp(App)

app.use(pinia)

app.use(router)

app.use(i18n)

app.use(ElementPlus, {
    locale: zhCn,
})

app.mount('#app')
