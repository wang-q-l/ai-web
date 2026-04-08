import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vant 样式
import 'vant/lib/index.css'
// 自定义样式
import './styles/index.css'
import './styles/variables.css'
import './styles/vant-custom.css'
// Mock 配置
import './mock'

// Vant 组件（全局注册）
import Vant from 'vant'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vant)

app.mount('#app')
