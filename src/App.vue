<template>
  <div>
    <v-app>
      <v-content>
        <v-card flat tile>
          <v-container fluid pa-0>
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
  import { getHashParams } from './util.js'
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
        let lang = 'de'
        let region = []
        let category = []
        let type = []
        let instrument = []

        for (let key in hash) {
          if(key === 'lang') lang = hash[key]
          if(key === 'region') region = hash[key].split(',').map(v => parseInt(v))
          if(key === 'category') category = hash[key].split(',').map(v => parseInt(v))
          if(key === 'type') type = hash[key].split(',').map(v => parseInt(v))
          if(key === 'instrument') instrument = hash[key].split(',').map(v => parseInt(v))
        }

        this.$store.commit('setLang', { lang: lang })
        this.$store.commit('setSelected', { table: 'region', data: region })
        this.$store.commit('setSelected', { table: 'category', data: category })
        this.$store.commit('setSelected', { table: 'type', data: type })
        this.$store.commit('setSelected', { table: 'instrument', data: instrument })

      }
    },
    watch: {
      currentLang: function(newVal, oldVal) {
        this.loadTerms()
      }
    },
    mounted() {
      this.loadHash()

      window.addEventListener('hashchange', (e) => {
        if(!this.hashChanging) {
          this.loadHash()
        }
      })

      this.loadTerms()

      const loadPhaseTable = this.$store.dispatch('loadPhaseTable')
      const loadCategoryTable = this.$store.dispatch('loadCategoryTable')
      const loadRegionTable = this.$store.dispatch('loadRegionTable')
      const loadTypeTable = this.$store.dispatch('loadTypeTable')

      Promise.all([ loadPhaseTable, loadCategoryTable, loadRegionTable, loadTypeTable ]).then(() => {
        this.$store.dispatch('loadInstrumentTable').catch((err) => {
          console.error(err)
        })
      }, (err) => {
        console.error(err)
      })
    }
  }
</script>
<style lang="scss">
  #app {
    max-width: 848px;
    margin: auto;
    background: #fff;
  }
</style>
