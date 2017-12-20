<template>
  <v-app>
    <v-content>
      <v-card flat tile>
        <v-container fluid pa-0>
          <v-layout row wrap>
            <v-flex xs12 md6>
              <v-select
                label="Jahre"
                v-bind:items="years"
                v-model="e7"
                multiple
                autocomplete
              ></v-select>
            </v-flex>
            <v-flex xs12 md6>
              <v-select
                label="Instrumente"
                v-bind:items="['Schweizer National Fond','Umwelttechnologie Förderung']"
                v-model="e8"
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
      years() {
        return this.$store.state.years
      }
    }
  }
</script>
