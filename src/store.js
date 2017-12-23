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
        5: { id: 5, instrumentId: 2, year: 2012, amount: 1240000 },
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
    instrumentsAll({ instrument }) {
      return instrument.list.map(id => instrument.data[id])
    },
    instrumentsSelected({ instrument }) {
      if(instrument.selected.length === 0) return instrument.list.map(id => instrument.data[id])
      return instrument.selected.map(id => instrument.data[id])
    },
    budgetsAll({ budget }) {
      return budget.list.map(id => budget.data[id])
    },
    years({ year }) {
      return year.list.map(id => year.data[id])
    },

    instruments(state, getters) {
      const amounts = {}
      const totals = {}
      const years = state.year.selected

      getters.budgetsAll.forEach((o, i) => {
        if(!amounts[o.instrumentId]) {
          amounts[o.instrumentId] = []
          totals[o.instrumentId] = 0
        }
        if(years.indexOf(o.year) !== -1 || years.length === 0){
          amounts[o.instrumentId].push(o)
          totals[o.instrumentId] += o.amount
        }
      })

      let maxAmount = 0
      const instruments = getters.instrumentsSelected.map(o => {
        if(totals[o.id] > maxAmount) maxAmount = totals[o.id]
        o.amounts = amounts[o.id]
        o.amount = totals[o.id]
        return o
      })

      const maxLength = maxAmount.toString().length

      let simpleMax = maxAmount/Math.pow(10, maxLength-2)*0.1

      const dividers = [0.2, 0.25, 0.5, 1, 2, 2.5];
      let divider = 1
      for(let i = 0; i < dividers.length; i++) {
        const v = dividers[i]
        const tMax = Math.ceil(simpleMax/v)*v
        const rest = tMax%v
        const mult = tMax/v
        if(rest === 0 && mult < 8 && mult > 3) {
          divider = v
          simpleMax = tMax
          break;
        }
      }

      const maxCeil = simpleMax*Math.pow(10, maxLength-2)*10

      const units = state.chart.units
      let unit = 0
      units.forEach((v, i) => {
        const place =  Math.floor(maxAmount/Math.pow(10, v.start))
        if(place >= 1){
          unit = v.start
        }
      })

      store.commit('setChart', {
        axisMax: maxCeil,
        axisTics: simpleMax/divider,
        axisDivider: divider,
        axisUnit: unit
      })

      return instruments
    }
  },
  actions: {}
})
