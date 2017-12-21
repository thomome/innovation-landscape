<template>
  <div class="chart-container">
    <svg width="100%" height="500px" ref="chart">
      <ilv-chart-axis direction="y"></ilv-chart-axis>
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
  import ilvChartAxis from './ilv-chart-axis.vue'

  export default {
    data() {
      return {}
    },
    components: {
      ilvChartBar, ilvChartAxis
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
        let maxCeil = Math.floor(maxAmount/Math.pow(10, maxLength-2))
        maxCeil = Math.ceil(maxCeil/5)*5*(Math.pow(10, maxLength-2))
        
        this.$store.commit('setChartMaxAmount', {
          maxAmount: maxCeil
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
