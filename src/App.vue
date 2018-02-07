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
            <v-layout row wrap justify-end>

              <v-flex xs12 sm12 pa-1>
                <v-select
                  :label="term('instruments')"
                  v-bind:items="instrumentOption"
                  v-model="$store.state.instrument.selected"
                  multiple
                  autocomplete
                  clearable
                  dense
                ></v-select>
              </v-flex>

              <v-flex xs12 sm4 pa-1>
                <v-subheader>{{ term('region') }}</v-subheader>
                <v-checkbox
                  v-for="opt in regionOption" :key="`reg-${opt.value}`"
                  :label="opt.text"
                  :value="opt.value"
                  v-model="$store.state.region.selected"
                  color="primary"
                  hide-details
                ></v-checkbox>
              </v-flex>

              <v-flex xs12 sm4 pa-1>
                <v-subheader>{{ term('category') }}</v-subheader>
                <v-checkbox
                  v-for="opt in categoryOption" :key="`cat-${opt.value}`"
                  :label="opt.text"
                  :value="opt.value"
                  v-model="$store.state.category.selected"
                  color="primary"
                  hide-details
                ></v-checkbox>
              </v-flex>
              <v-flex xs12 sm4 pa-1>
                <v-subheader>{{ term('budget_item') }}</v-subheader>
                <v-checkbox
                  v-for="opt in typeOption" :key="`typ-${opt.value}`"
                  :label="opt.text"
                  :value="opt.value"
                  v-model="$store.state.type.selected"
                  color="primary"
                  hide-details
                ></v-checkbox>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-content>
    </v-app>
    <ilv-tooltip></ilv-tooltip>
  </div>
</template>

<script>
  import ilvChart from './components/ilv-chart.vue'
  import ilvTooltip from './components/ilv-tooltip.vue'

  export default {
    components: {
      ilvChart, ilvTooltip
    },
    data () {
      return {}
    },
    computed: {
      instrumentOption() {
        return this.$store.getters.instrumentAll.map(o => { return { text: o.institution + ': ' + o.instrument, value: o.id } })
      },
      categoryOption() {
        return this.$store.getters.categoryAll.map(o => { return { text: this.term(o), value: o.id } })
      },
      regionOption() {
        return this.$store.getters.regionAll.map(o => { return { text: this.term(o), value: o.id } })
      },
      typeOption() {
        return this.$store.getters.typeAll.map(o => { return { text: this.term(o), value: o.id } })
      },
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
      }
    },
    watch: {
      currentLang: function(newVal, oldVal) {
        this.loadTerms()
      }
    },
    mounted() {
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
  }
</style>
