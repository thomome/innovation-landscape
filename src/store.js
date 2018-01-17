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
      width: null,
      height: null,
      zoom: 1,
      axisSpace: 60,
      units: [
        { label: 'default', start: 0 },
        { label: 'thousand', start: 3 },
        { label: 'million', start: 6 },
        { label: 'billion', start: 9 }
      ]
    },
    instrument: { list: [1,2,3], selected: [],
      data: {
        1: { id: 1, name: 'Schweizer National Fond', regionId: 2, from: 0.1, to: 2, budget: { t: 80000000, a: 60000000, u: 10000000, e: 20000000 } },
        2: { id: 2, name: 'Umwelttechnologie Förderung', regionId: 2, from: 1.5, to: 3, budget: { t: 4000000, a: 0, u: 4000000, e: 0 } },
        3: { id: 3, name: 'Forstforschung', regionId: 1, from: 3, to: 4.5, amount: 8034000, budget: {  t: 4000000, a: 0, u: 4000000, e: 0 } },
      }
    },
    region: { list: [1,2], selected: [],
      data: {
        1: { id: 1, name: 'EU' },
        2: { id: 2, name: 'CH' }
      }
    },
    category: { list: [1,2,3], selected: [],
      data: {
        1: { id: 1, name: 'Allegmein' },
        2: { id: 2, name: 'Umwelt' },
        3: { id: 3, name: 'Energie' }
      }
    },
    phase: { list: [1,2,3,4,5,6],
      data: {
        1: { id: 1, name: 'Grundlagenforschung' },
        2: { id: 2, name: 'Angewandte Forschung' },
        3: { id: 3, name: 'Laborprototypen' },
        4: { id: 4, name: 'Pilotierung & Demonstration' },
        5: { id: 5, name: 'Marktzulassung- & einführung' },
        6: { id: 6, name: 'Marktdiffusion & Exportförderung' },
      }
    },
    cacheDuration: (1000*60*60*24*3) // 3 days
  },
  mutations: {
    setChartZoom({ chart }, data) {
      Vue.set(chart, 'zoom', data.zoom)
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
    allPhases({ phase }) {
      return phase.list.map(id => phase.data[id])
    },

    allCategories({ category }) {
      return category.list.map(id => category.data[id])
    },
    availableCategories({ category }) {
      return category.list.map(id => category.data[id]) // Replace with available
    },

    allRegions({ region }) {
      return region.list.map(id => region.data[id])
    },
    availableRegions({ region }){
      return region.list.map(id => region.data[id]) // Replace with available
    },

    allInstruments({ instrument }) {
      return instrument.list.map(id => instrument.data[id])
    },
    availableInstruments(state, getters) {
      const selectedRegions = state.region.selected
      const selectedInstruments = state.instrument.selected
      const selectedCategories = state.category.selected

      const instruments = getters.allInstruments.filter((v) => {
        const cI = (selectedInstruments.indexOf(v.id) !== -1 || selectedInstruments.length === 0)
        const cR = (selectedRegions.indexOf(v.regionId) !== -1 || selectedRegions.length === 0)
        const cC = (selectedCategories.indexOf(v.categoryId) !== -1 || selectedCategories.length === 0)

        if(cI && cR && cC) {
          return true
        }
      })

      store.commit('setChartZoom', { zoom: 1 })

      return instruments
    },
    xAxis(state, getters) {
      const instruments = getters.availableInstruments
      let minFrom = Infinity
      let maxTo = 0
      instruments.forEach((v) => {
        if(minFrom > v.from) minFrom = v.from
        if(maxTo < v.to) maxTo = v.to
      })
      return {
        from: Math.floor(minFrom),
        to: Math.ceil(maxTo),
        tics: Math.ceil(maxTo) - Math.floor(minFrom)
      }
    },
    yAxisMax(state, getters) {
      const instruments = getters.availableInstruments
      const zoom = state.chart.zoom
      let maxAmount = 0
      instruments.forEach((v) => {
        if(v.amount > maxAmount) maxAmount = v.amount
      })
      return Math.round(maxAmount*zoom)
    },
    yAxis(state, getters) {
      const maxAmount = getters.yAxisMax
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
      let unit = {}
      units.forEach((v, i) => {
        const place =  Math.floor(maxAmount/Math.pow(10, v.start))
        if(place >= 1){
          unit = v
        }
      })

      return {
        max: maxCeil,
        tics: simpleMax/divider,
        divider: divider,
        unit: unit
      }
    }
  },
  actions: {}
})
