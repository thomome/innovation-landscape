<template>
  <div class="chart-container">
    <svg width="100%" height="500px" ref="chart">
      <ilv-chart-axis-x direction="y"></ilv-chart-axis-x>
      <g class="bars">
        <ilv-chart-bar
          v-for="inst in instruments"
          :key="'instrument-' + inst.id"
          :from="inst.from"
          :to="inst.to"
          :amount="inst.amount"
        ></ilv-chart-bar>
      </g>
    </svg>
  </div>
</template>

<script>
  import ilvChartBar from './ilv-chart-bar.vue'
  import ilvChartAxisX from './ilv-chart-axis-x.vue'
  import { roundNumber } from './../util.js'

  export default {
    data() {
      return {}
    },
    components: {
      ilvChartBar, ilvChartAxisX
    },
    computed: {
      instruments() {
        const amounts = {}
        const totals = {}
        const years = this.$store.state.year.selected

        this.$store.getters.budgets.forEach((o, i) => {
          if(!amounts[o.instrumentId]) {
            amounts[o.instrumentId] = []
            totals[o.instrumentId] = 0
          }
          if(years.indexOf(o.year) !== -1 || years.length === 0){
            amounts[o.instrumentId].push(o)
            totals[o.instrumentId] += o.amount
          }
        })
        let maxAmount = 0
        const instruments = this.$store.getters.instrumentsSelected.map(o => {
          if(totals[o.id] > maxAmount) maxAmount = totals[o.id]
          o.amounts = amounts[o.id]
          o.amount = totals[o.id]
          return o
        })

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

        const units = this.$store.state.chart.units
        let unit = 0
        units.forEach((v, i) => {
          const place =  Math.floor(maxAmount/Math.pow(10, v.start))
          if(place >= 1){
            unit = v.start
          }
        })

        this.$store.commit('setChart', {
          axisMax: maxCeil,
          axisTics: simpleMax/divider,
          axisDivider: divider,
          axisUnit: unit
        })

        return instruments
      }
    },
    methods: {
      updateSize() {
        this.$store.commit('setChartDimension', {
          width: this.$refs.chart.clientWidth,
          height: this.$refs.chart.clientHeight
        })

      }
    },
    mounted: function () {
      this.updateSize()
      window.addEventListener('resize', this.updateSize)
    },
    beforeDestroy: function () {
      window.removeEventListener('resize', this.updateSize)
    }
  }
</script>

<style lang="scss" scoped>
  .chart-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 66.66%;

    svg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
</style>
