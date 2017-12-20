import Vue from 'vue'
import Vuex from 'vuex'

import { intersect, setHashParams, ajax } from './util.js'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    language: {
      selected: 'de',
      terms: {}
    },
    years: [2011,2012,2013,2014,2015,2016,2017],
    cacheDuration: (1000*60*60*24*3) // 3 days
  },
  mutations: {},
  getters: {},
  actions: {}
})
