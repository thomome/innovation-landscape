<template>
  <v-app>
    <v-content>
      <v-card flat tile>
        <v-container fluid pa-0>
          <v-layout row wrap justify-end>
            <v-flex xs12 sm4 ma-1>
              <v-select
                label="Instrumente"
                v-bind:items="instruments"
                v-model="$store.state.instrument.selected"
                multiple
                autocomplete
                clearable
              ></v-select>
            </v-flex>
            <v-flex xs12 sm4 ma-1>
              <v-select
                label="Jahre"
                v-bind:items="years"
                v-model="$store.state.year.selected"
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
      return {
        e7: [],
        e8: [],
      }
    },
    computed: {
      instruments() {
        return this.$store.getters.instrumentsAll.map(o => { return { text: o.name, value: o.id } })
      },
      years() {
        return this.$store.getters.years.map(o => { return { text: o.name, value: o.id } })
      }
    }
  }
</script>
