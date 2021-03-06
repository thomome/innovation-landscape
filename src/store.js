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
    instrument: { list: [], data: {}, selected: [], available: [] },
    region: { list: [], data: {}, selected: [], available: [] },
    category: { list: [], data: {}, selected: [], available: [] },
    phase: { list: [], data: {}, selected: [], available: [] },
    type: { list: [], data: {}, selected: [], available: [] },
    cacheDuration: (1000*60*60*24*3) // 3 days,
  },
  mutations: {
    setLang(state, data){
      Vue.set(state.language, 'selected', data.lang)
    },
    initLang(state, data) {
      Vue.set(state.language, 'terms', data.data)
    },
    setSelected(state, data) {
      Vue.set(state[data.table], 'selected', data.data)
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
    term(state) {
      const self = this
      const lang = state.language.selected
      const terms = state.language.terms
      let term = ''
      return function(data) {
        if(typeof data === 'object'){
          term = data[lang] ? data[lang] : 'undefined'
        } else if(typeof data === 'string') {
          term = terms[data] ? terms[data] : data
        }
        return term
      }
    },
    phaseAll({ phase }) {
      return phase.list.map(id => phase.data[id])
    },
    categoryAll({ category }) {
      return category.list.map(id => category.data[id])
    },
    regionAll({ region }) {
      return region.list.map(id => region.data[id])
    },
    typeAll({ type }) {
      return type.list.map(id => type.data[id])
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
    typeSelected({ type }) {
      return type.selected.length > 0 ? type.selected : [type.list[0]]
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
    typeAvailable({ type }) {
      return type.available.map(id => type.data[id])
    },
    instrumentAvailable(state, getters) {
      const selectedRegions = state.region.selected
      const selectedInstruments = state.instrument.selected
      const selectedCategories = state.category.selected
      const selectedTypes = state.type.selected


      const instruments = getters.instrumentAll.filter(v => {
        const cI = (selectedInstruments.indexOf(v.id) !== -1 || selectedInstruments.length === 0)
        const cR = (selectedRegions.indexOf(v.regionId) !== -1 || selectedRegions.length === 0)
        const cC = (intersect(selectedCategories, v.categoryIds).length !== 0 || selectedCategories.length === 0)
        let cT = selectedTypes.length === 0
        if(!cT) {
          v.budget.some(b => {
            if(intersect(selectedTypes, b.typeIds).length !== 0) {
              cT = true
              return false
            }
          })
        }

        if(cI && cR && cC && cT) {
          return true
        }
      })

      const sortedInstruments = instruments.sort((a,b) => {
        let aMax = 0
        a.budget.forEach(bud => {
          if(intersect(selectedTypes, bud.typeIds).length !== 0 || selectedTypes.length === 0) {
            if(bud.amount > aMax) aMax = bud.amount
          }
        })

        let bMax = 0
        b.budget.forEach(bud => {
          if(intersect(selectedTypes, bud.typeIds).length !== 0 || selectedTypes.length === 0) {
            if(bud.amount > bMax) bMax = bud.amount
          }
        })
        return bMax - aMax
      })

      const instsPerCategory = {}
      sortedInstruments.some((v, i) => {
        const id = v.categoryIds.length < 2 ? v.categoryIds[0] : 'mixed'
        if(instsPerCategory[id]){
          instsPerCategory[id]++
        } else {
          instsPerCategory[id] = 1
        }
        sortedInstruments[i].shade = instsPerCategory[id]
      })
      sortedInstruments.some((v, i) => {
        const id = v.categoryIds.length < 2 ? v.categoryIds[0] : 'mixed'
        sortedInstruments[i].angle = (v.shade % 2)*2-1
        sortedInstruments[i].shade = 1 - (1/instsPerCategory[id]*v.shade)
      })

      return sortedInstruments
    }
  },
  actions: {
    loadRegionTable({ commit, state, dispatch }) {
      return new Promise((resolve, reject) => {
        dispatch('loadTable', { table: 'region' }).then(data => {
          if(data) {
            const preparedData = data.map(v => {
              return {
                id: parseInt(v.id),
                short: v.short ? v.short.trim() : '',
                en: v.en ? v.en.trim() : '',
                de: v.de ? v.de.trim() : '',
                fr: v.fr ? v.fr.trim() : '',
                it: v.it ? v.it.trim() : ''
              }
            })
            commit('initTable', { table: 'region', data: preparedData })
            dispatch('saveTable', { table: 'region', data: preparedData })
          }
          resolve()
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
                id: parseInt(v.id),
                total: (v.total == 'true'),
                color: v.color ? v.color.trim() : '',
                en: v.en ? v.en.trim() : '',
                de: v.de ? v.de.trim() : '',
                fr: v.fr ? v.fr.trim() : '',
                it: v.it ? v.it.trim() : ''
              }
            })
            commit('initTable', { table: 'category', data: preparedData })
            dispatch('saveTable', { table: 'category', data: preparedData })
          }
          resolve()
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
                id: parseInt(v.id),
                en: v.en ? v.en.trim() : '',
                de: v.de ? v.de.trim() : '',
                fr: v.fr ? v.fr.trim() : '',
                it: v.it ? v.it.trim() : ''
              }
            })
            commit('initTable', { table: 'phase', data: preparedData })
            dispatch('saveTable', { table: 'phase', data: preparedData })
          }
          resolve()
        }, err => {
          reject(err)
        })
      })
    },
    loadTypeTable({ commit, state, dispatch }) {
      return new Promise(( resolve, reject ) => {
        dispatch('loadTable', { table: 'type' }).then(data => {
          if(data) {
            const preparedData = data.map(v => {
              return {
                id: parseInt(v.id),
                en: v.en ? v.en.trim() : '',
                de: v.de ? v.de.trim() : '',
                fr: v.fr ? v.fr.trim() : '',
                it: v.it ? v.it.trim() : '',
                color: v.color ? v.color.trim() : ''
              }
            })
            commit('initTable', { table: 'type', data: preparedData })
            dispatch('saveTable', { table: 'type', data: preparedData })
          }
          resolve()
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
              const allTypes = getters.typeAll
              const items = []
              const categoryIds = v.categoryIds.split(',').map(id => parseInt(id))

              Object.keys(v).forEach((k, i) => {

                const budgets = k.split(';')
                const types = []
                const source = v[budgets.join('_')+'_source']

                budgets.forEach(b => {
                  allTypes.forEach(t => {
                    if(b === t.en && parseInt(v[k]) !== 0) {
                      types.push(t.id)
                    }
                  })
                })
                if(types.length > 0) {
                  items.push({
                    typeIds: types,
                    amount: parseInt(v[k]),
                    source: source
                  })
                }
              })

              return {
                id: parseInt(v.id),
                de: v.de ? v.de.trim() : '',
                fr: v.fr ? v.fr.trim() : '',
                it: v.it ? v.it.trim() : '',
                en: v.en ? v.en.trim() : '',
                regionId: parseInt(v.regionId),
                categoryIds: categoryIds,
                from: parseFloat(v.from),
                to: parseFloat(v.to),
                website: v.website ? v.website.trim() : '',
                budget: items
              }
            })

            commit('initTable', { table: 'instrument', data: preparedData })
            dispatch('saveTable', { table: 'instrument', data: preparedData })
          }
          resolve()
        }, err => {
          reject(err)
        })
      })
    },
    loadLanguage({ commit, state, dispatch, getters }, lang) {
      return new Promise((resolve, reject) => {
        ajax(`./public/data/lang.${lang}.json`, data => {
          const parsedLang = JSON.parse(data)
          commit('initLang', { data: parsedLang })
          resolve()
        }, err => {
          reject(`${err} (lang-${lang}.json)`)
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
          commit('initTable', { table: data.table, data: JSON.parse(dbTable) })
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
