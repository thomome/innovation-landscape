import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import { store } from './store.js'
import { eventHub } from './event-hub.js'

import 'vuetify/dist/vuetify.css'

Vue.use(Vuetify, {
  theme: {
    primary: '#069'
  }
})

Vue.mixin({
  data: function () {
    return {
      eventHub: eventHub
    }
  }
})

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
