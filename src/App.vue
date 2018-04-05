<template>
  <div>
    <v-app>
      <v-content>
        <v-card flat tile >
          <v-container fluid pa-0 ref="app">
            <v-layout row wrap>
              <v-flex xs12 pa-0>
                <ilv-chart></ilv-chart>
              </v-flex>
            </v-layout>
            <ilv-filter-drawer></ilv-filter-drawer>
          </v-container>
        </v-card>
      </v-content>
    </v-app>
    <ilv-tooltip></ilv-tooltip>
  </div>
</template>

<script>
  import { getHashParams, setHashParams } from './util.js'
  import ilvChart from './components/ilv-chart.vue'
  import ilvTooltip from './components/ilv-tooltip.vue'
  import ilvFilterDrawer from './components/ilv-filter-drawer.vue'

  export default {
    components: {
      ilvChart, ilvTooltip, ilvFilterDrawer
    },
    data () {
      return {
        hashChanging: false
      }
    },
    computed: {
      currentLang() {
        return this.$store.state.language.selected
      }
    },
    methods: {
      term(obj) {
        return this.$store.getters.term(obj)
      },
      loadTerms() {
        this.$store.dispatch('loadLanguage', this.currentLang)
      },
      loadHash() {
        const hash = getHashParams()
        const state = this.$store.state
        let lang = 'de'
        let zoom = false
        let region = []
        let category = []
        let type = []
        let instrument = []

        for (let key in hash) {
          if(key === 'zoom') zoom = parseFloat(hash[key])
          if(key === 'lang') lang = hash[key]
          if(key === 'region') region = hash[key].split(',').map(v => parseInt(v))
          if(key === 'category') category = hash[key].split(',').map(v => parseInt(v))
          if(key === 'type') type = hash[key].split(',').map(v => parseInt(v))
          if(key === 'instrument') instrument = hash[key].split(',').map(v => parseInt(v))
        }

        if(lang != state.language.selected) this.$store.commit('setLang', { lang: lang })
        if(zoom) {
          window.setTimeout(() => {
            this.eventHub.$emit('set-zoom', zoom)
          }, 10)
        }
        if(region.toString() != state.region.selected.toString()) this.$store.commit('setSelected', { table: 'region', data: region })
        if(category.toString() != state.category.selected.toString()) this.$store.commit('setSelected', { table: 'category', data: category })
        if(type.toString() != state.type.selected.toString()) this.$store.commit('setSelected', { table: 'type', data: type })
        if(instrument.toString() != state.instrument.selected.toString()) this.$store.commit('setSelected', { table: 'instrument', data: instrument })
      },
      resizeIframe(){

        const extra = 200
        const height = this.$refs.app.clientHeight
        window.frameElement.style.height = (height+extra) + 'px'
      }
    },
    watch: {
      currentLang: function(newVal, oldVal) {
        this.loadTerms()
      }
    },
    mounted() {
      const self = this
      const domain = document.domain.match(/[a-z0-9\-]*.[a-z0-9\-]+$/i)[0]
      document.domain = domain
      const iframe = window.frameElement

      if(iframe){
        window.addEventListener('resize', this.resizeIframe)
        this.eventHub.$on('app-resize', () => {
          this.resizeIframe()
        })

        this.iframeHashUpdater = window.setInterval(() => {
          this.loadHash()
        }, 50)
      } else {
        window.addEventListener('hashchange', () => {
          this.loadHash()
        })
      }

      this.loadTerms()

      const loadPhaseTable = this.$store.dispatch('loadPhaseTable')
      const loadCategoryTable = this.$store.dispatch('loadCategoryTable')
      const loadRegionTable = this.$store.dispatch('loadRegionTable')
      const loadTypeTable = this.$store.dispatch('loadTypeTable')
      Promise.all([ loadPhaseTable, loadCategoryTable, loadRegionTable, loadTypeTable ]).then(() => {
        this.$store.dispatch('loadInstrumentTable').then(() => {
          this.loadHash()
          // standard params for "Umwelt Schweiz" view
          const hash = getHashParams()
          if(!hash.region && !hash.type && !hash.instrument && !hash.category) {
            setHashParams('region', [0])
            setHashParams('type', [1])
            setHashParams('zoom', [0.07])
          }
        }).catch((err) => {
          console.error(err)
        })
      }, (err) => {
        console.error(err)
      })
    }
  }
</script>
<style lang="scss">
  html {
    overflow: hidden;
  }
  #app {
    max-width: 848px;
    margin: auto;
    background: #fff;
  }
</style>
