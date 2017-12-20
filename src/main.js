import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import { store } from './store.js'

import 'vuetify/dist/vuetify.css'

Vue.use(Vuetify, {
  theme: {
    primary: '#069'
  }
})

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
