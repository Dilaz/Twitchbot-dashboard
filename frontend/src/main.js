import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import IconBase from '@/components/IconBase.vue'
import IconTwitch from '@/components/IconTwitch.vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue';
import Profile from '@/components/Profile.vue';

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.component('icon-base', IconBase);
Vue.component('icon-twitch', IconTwitch);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/login', },
    { path: '/login/:token', component: Login },
    { path: '/login', name: 'login', component: Login },
    { path: '/profile', name: 'profile', component: Profile },
    { path: '*', redirect: '/login' }
  ],
})

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
