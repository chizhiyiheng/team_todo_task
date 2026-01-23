import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css' // 如果完全使用 SCSS 变量覆盖，这行可能需要移除或调整，但为了保险起见先保留，SCSS 会覆盖它
import Vant from 'vant'
import 'vant/lib/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import i18n from './locales'
import './styles/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(Vant)

Object.keys(ElementPlusIconsVue).forEach(key => {
  app.component(key, ElementPlusIconsVue[key])
})

app.mount('#app')
