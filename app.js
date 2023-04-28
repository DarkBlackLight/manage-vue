import {createApp} from 'vue'

// 引入pinia，用于状态管理
import pinia from './stores'

// 引入路由router
import router from './router'

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
