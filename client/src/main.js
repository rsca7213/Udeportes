import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

sessionStorage.setItem('SERVER_PORT', '5000');
sessionStorage.setItem('SERVER_URL', 'http://localhost');

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
