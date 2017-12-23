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
    chart: {
      width: 1,
      height: 1,
      maxAmount: 1,
      axisSpace: 40,
      units: [
        { label: 'default', start: 0 },
        { label: 'thousand', start: 3 },
        { label: 'million', start: 6 },
        { label: 'billion', start: 9 }
      ]
    },
    instrument: { list: [1,2], selected: [],
      data: {
        1: { id: 1, name: 'SNF', from: 0, to: 25 },
        2: { id: 2, name: 'UTF', from: 30, to: 45 }
      }
    },
    budget: { list: [1,2,3,4,5,6],
      data: {
        1: { id: 1, instrumentId: 1, year: 2011, amount: 24400000 },
        2: { id: 2, instrumentId: 1, year: 2012, amount: 26100000 },
        3: { id: 3, instrumentId: 1, year: 2013, amount: 9340000 },
        4: { id: 4, instrumentId: 2, year: 2011, amount: 834000 },
        5: { id: 5, instrumentId: 2, year: 2012, amount: 1250000 },
        6: { id: 6, instrumentId: 2, year: 2013, amount: 4450000 },
      }
    },
    year: { list: [2011,2012,2013], selected: [],
      data: {
        2011: { id: 2011, name: 2011 },
        2012: { id: 2012, name: 2012 },
        2013: { id: 2013, name: 2013 }
      }
    },
    cacheDuration: (1000*60*60*24*3) // 3 days
  },
  mutations: {
    setChart({ chart }, data) {
      const keys = Object.keys(data)
      keys.forEach((v) => {
        Vue.set(chart, v, data[v])
      })
    },
    setChartDimension({ chart }, data) {
      Vue.set(chart, 'width', data.width)
      Vue.set(chart, 'height', data.height)
    },
    setChartMaxAmount({ chart }, data) {
      Vue.set(chart, 'maxAmount', data.maxAmount)
    }
  },
  getters: {
    instruments({ instrument }) {
      return instrument.list.map(id => instrument.data[id])
    },
    instrumentsSelected({ instrument }) {
      return instrument.selected.map(id => instrument.data[id])
    },
    budgets({ budget }) {
      return budget.list.map(id => budget.data[id])
    },
    years({ year }) {
      return year.list.map(id => year.data[id])
    }
  },
  actions: {}
})
