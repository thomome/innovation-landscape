<template>
  <v-app>
    <v-content>
      <v-card flat tile>
        <v-container fluid pa-0>
          <v-layout row wrap justify-end>
            <v-flex xs12 sm6 pa-1>
              <v-select
                label="Region"
                v-bind:items="regions"
                v-model="$store.state.region.selected"
                multiple
                autocomplete
                clearable
              ></v-select>
            </v-flex>
            <v-flex xs12 sm6 pa-1>
              <v-select
                label="Category"
                v-bind:items="categories"
                v-model="$store.state.category.selected"
                multiple
                autocomplete
                clearable
              ></v-select>
            </v-flex>
            <v-flex xs12 sm12 pa-1>
              <v-select
                label="Instrumente"
                v-bind:items="instruments"
                v-model="$store.state.instrument.selected"
                multiple
                autocomplete
                clearable
              ></v-select>
            </v-flex>

          </v-layout>
          <v-layout row wrap>
            <v-flex xs12 pa-0>
              <ilv-chart></ilv-chart>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-content>
  </v-app>
</template>

<script>
  import ilvChart from './components/ilv-chart.vue'

  export default {
    components: {
      ilvChart
    },
    data () {
      return {}
    },
    computed: {
      instruments() {
        return this.$store.getters.allInstruments.map(o => { return { text: o.name, value: o.id } })
      },
      categories() {
        return this.$store.getters.availableCategories.map(o => { return { text: o.name, value: o.id } })
      },
      regions() {
        return this.$store.getters.availableRegions.map(o => { return { text: o.name, value: o.id } })
      }
    }
  }
</script>
