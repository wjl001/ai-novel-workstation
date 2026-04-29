import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { useProductDesignStore } from './store/productDesign'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// Initialize store from localStorage
const store = useProductDesignStore(pinia)
store.loadFromLocalStorage()
void store.loadFromServer()

app.mount('#app')
