import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/styles/index.scss'
import { useAuthStore } from '@/store/modules/auth'
import * as authAPI from '@/api/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
const authStore = useAuthStore(pinia)
authStore.loadFromStorage()
if (authStore.token) {
  authAPI
    .getCurrentUser()
    .then(user => authStore.updateUser(user))
    .catch(() => authStore.clearAuth())
}
app.use(router)
app.use(ElementPlus)

app.mount('#app')
