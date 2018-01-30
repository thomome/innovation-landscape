<template>
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
            <v-flex xs12 sm6 pa-1>
              <v-select
                label="Region"
                v-bind:items="regionOption"
                v-model="$store.state.region.selected"
                multiple
                autocomplete
                clearable
                dense
              ></v-select>
            </v-flex>
            <v-flex xs12 sm6 pa-1>
              <v-select
                label="Category"
                v-bind:items="categoryOption"
                v-model="$store.state.category.selected"
                multiple
                autocomplete
                clearable
                dense
              ></v-select>
            </v-flex>
            <v-flex xs12 sm6 pa-1>
              <v-select
                label="Instrumente"
                v-bind:items="instrumentOption"
                v-model="$store.state.instrument.selected"
                multiple
                autocomplete
                clearable
                dense
              ></v-select>
            </v-flex>
            <v-flex xs12 sm6 pa-1>
              <v-select
                label="Budget"
                v-bind:items="typeOption"
                v-model="$store.state.type.selected"
                multiple
                autocomplete
                clearable
                dense
              ></v-select>
            </v-flex>

          </v-layout>

        </v-container>
      </v-card>
    </v-content>
    <ilv-tooltip></ilv-tooltip>
  </v-app>
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
        return this.$store.getters.categoryAll.map(o => { return { text: o.en, value: o.id } })
      },
      regionOption() {
        return this.$store.getters.regionAll.map(o => { return { text: o.en, value: o.id } })
      },
      typeOption() {
        return this.$store.getters.typeAll.map(o => { return { text: o.en, value: o.id } })
      }
    },
    mounted() {
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
