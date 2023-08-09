import { createApp } from 'vue'
import login from './login.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

createApp(login).use(ElementPlus,{dark:'auto'}).mount('#login')
