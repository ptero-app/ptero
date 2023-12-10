import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'

import App from './App.vue'

const app = createApp(App)

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
app.use(router)

const pinia = createPinia()
app.use(pinia)

app.mount('#app')
