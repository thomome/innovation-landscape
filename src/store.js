import Vue from 'vue'
import Vuex from 'vuex'
import Papa from 'papaparse'

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
    instrument: { list: [], selected: [], data: {} },
    region: { list: [], selected: [], data: {} },
    category: { list: [], selected: [], data: {} },
    phase: { list: [], data: {} },
    cacheDuration: 0 //(1000*60*60*24*3) // 3 days
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
    },
    initTable(state, data) {
      const tableData = {}
      const tableList = []
      data.data.forEach(v => {
        tableData[v.id] = v
        tableList.push(v.id)
      })

      Vue.set(state[data.table], 'list', tableList)
      Vue.set(state[data.table], 'data', tableData)
    }
  },
  getters: {
    phaseAll({ phase }) {
      return phase.list.map(id => phase.data[id])
    },
    categoryAll({ category }) {
      return category.list.map(id => category.data[id])
    },
    regionAll({ region }) {
      return region.list.map(id => region.data[id])
    },
    instrumentAll({ instrument }) {
      return instrument.list.map(id => instrument.data[id])
    },

    phaseSelected({ phase }) {
      return phase.selected.map(id => phase.data[id])
    },
    categorySelected({ category }) {
      return category.selected.map(id => category.data[id])
    },
    regionSelected({ region }) {
      return region.selected.map(id => region.data[id])
    },
    instrumentSelected({ instrument }) {
      return instrument.selected.map(id => instrument.data[id])
    },

    phaseAvailable({ phase }) {
      return phase.available.map(id => phase.data[id])
    },
    categoryAvailable({ category }) {
      return category.available.map(id => category.data[id])
    },
    regionAvailable({ region }) {
      return region.available.map(id => region.data[id])
    },
    instrumentAvailable({ instrument }) {
      return instrument.available.map(id => instrument.data[id])
    },
    instrumentAvailable(state, getters) {
      const selectedRegions = state.region.selected
      const selectedInstruments = state.instrument.selected
      const selectedCategories = state.category.selected

      const instruments = getters.instrumentAll.filter(v => {
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
      instruments.forEach(v => {
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
      instruments.forEach(v => {
        if(v.budget.t > maxAmount) maxAmount = v.budget.t
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
  actions: {
    loadRegionTable({ commit, state, dispatch }) {
      return new Promise((resolve, reject) => {
        dispatch('loadTable', { table: 'region' }).then(data => {
          if(data) {
            const preparedData = data.map(v => {
              return {
                id: v.id,
                short: v.short,
                en: v.en,
                de: v.de,
                fr: v.fr,
                it: v.it
              }
            })
            commit('initTable', { table: 'region', data: preparedData })
            dispatch('saveTable', { table: 'region', data: preparedData })
            resolve()
          }
        }, err => {
          reject(err)
        })
      })
    },
    loadCategoryTable({ commit, state, dispatch }) {
      return new Promise((resolve, reject) => {
        dispatch('loadTable', { table: 'category' }).then(data => {
          if(data) {
            const preparedData = data.map(v => {
              return {
                id: v.id,
                en: v.en,
                de: v.de,
                fr: v.fr,
                it: v.it
              }
            })
            commit('initTable', { table: 'category', data: preparedData })
            dispatch('saveTable', { table: 'category', data: preparedData })
            resolve()
          }
        }, err => {
          reject(err)
        })
      })
    },
    loadPhaseTable({ commit, state, dispatch }) {
      return new Promise(( resolve, reject ) => {
        dispatch('loadTable', { table: 'phase' }).then(data => {
          if(data) {
            const preparedData = data.map(v => {
              return {
                id: v.id,
                en: v.en,
                de: v.de,
                fr: v.fr,
                it: v.it
              }
            })
            commit('initTable', { table: 'phase', data: preparedData })
            dispatch('saveTable', { table: 'phase', data: preparedData })
            resolve()
          }
        }, err => {
          reject(err)
        })
      })
    },
    loadInstrumentTable({ commit, state, dispatch, getters }) {
      return new Promise((resolve, reject) => {
        dispatch('loadTable', { table: 'instrument' }).then(data => {
          if(data) {
            const preparedData = data.map(v => {
              const categories = getters.categoryAll
              const items = []
              const categoryIds = []
              const checkCategoryIds = {}

              categories.forEach(c => {
                if(v[c.en]) {
                  if(v[c.en] > 0) {
                    items.push({ categoryIds: [c.id], amount: v[c.en] })
                    if(!checkCategoryIds[c.id]){
                      categoryIds.push(c.id)
                      checkCategoryIds[c.id] = true
                    }
                  }
                }
              })
              if(v.environment_energy) {
                if(v.environment_energy > 0) {
                  const ids = []
                  categories.forEach(c => {
                    if(c.en === 'energy' || c.en === 'environment') {
                      ids.push(c.id)
                      if(!checkCategoryIds[c.id]){
                        categoryIds.push(c.id)
                        checkCategoryIds[c.id] = true
                      }
                    }
                  })
                  items.push({ categoryIds: ids, amount: v.environment_energy })
                }
              }

              return {
                id: v.id,
                institution: v.institution,
                instrument: v.instrument,
                regionId: v.regionId,
                categoryIds: categoryIds,
                from: v.from,
                to: v.to,
                budget: {
                  total: v.total,
                  items: items
                }
              }
            })
            commit('initTable', { table: 'instrument', data: preparedData })
            dispatch('saveTable', { table: 'instrument', data: preparedData })
            resolve()
          }
        }, err => {
          reject(err)
        })
      })
    },

    saveTable({ commit, state }, data) {
      localStorage.setItem(`db-${data.table}`, JSON.stringify(data.data))
      if(data.table === 'instrument') localStorage.setItem('db-date', Date.now())
    },

    loadTable({commit, state}, data) {
      return new Promise((resolve, reject) => {
        const dbDate = localStorage.getItem('db-date')
        const dbTable = localStorage.getItem(`db-${data.table}`)
        if((Date.now() - dbDate) < state.cacheDuration && dbTable){
          commit('initData', { table: data.table, data: JSON.parse(dbTable) })
          resolve(false)
        } else {
          ajax(`./public/data/${data.table}.csv`, data => {
            const parsedCSV = Papa.parse(data, { header: true, skipEmptyLines: true })
            resolve(parsedCSV.data)
          }, err => {
            reject(`${err} (${data.table})`)
          })
        }
      })
    }

  }
})
