import { createApp } from 'vue'
import pinia from '@/stores/store.js'
import VueCookies from 'vue-cookies'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import 'animate.css'
import './assets/base.scss'
import DialogModule from './components/DialogModule.vue'
// 全局方法Verify
import Verify from './utils/Verify.js'
import Message from './utils/Message.js'
import Request from './utils/Request.js'
import Utils from './utils/Utils.js'
import Confirm from './utils/Confirm.js'
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.config.globalProperties.VueCookies = VueCookies
app.config.globalProperties.Verify = Verify
app.config.globalProperties.Message = Message
app.config.globalProperties.Request = Request
app.config.globalProperties.Utils = Utils
app.config.globalProperties.Confirm = Confirm
app.config.globalProperties.globalInfo = {
    bodyWidth: 1300,
    avatarUrl: '/api/file/getAvatar/',
    imageUrl: '/api/file/getImage/',
    maxFileSize: 1024 * 1024 * 100
}
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.component('DialogModule', DialogModule)
app.mount('#app')
