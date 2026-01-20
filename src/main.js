import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
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
app.use(ElementPlus)
app.use(Vant)

Object.keys(ElementPlusIconsVue).forEach(key => {
  app.component(key, ElementPlusIconsVue[key])
})

app.mount('#app')
