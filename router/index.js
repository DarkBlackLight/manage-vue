import {createRouter, createWebHistory} from 'vue-router'
import {useAuth} from '../stores/auth'

import routes from '@/router/routes'

console.log(routes);

const initRouter = () => {
    const router = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: routes
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

    return router
}
export default initRouter
