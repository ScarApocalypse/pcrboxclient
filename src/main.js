import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import "./plugins/element.js"
// 导入axios
import axios from "axios"
// 配置请求根路径
axios.defaults.baseURL = `http://106.52.133.22:18083/pcr/`
// axios.defaults.baseURL = `http://127.0.0.1:18083/pcr/`

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app")
