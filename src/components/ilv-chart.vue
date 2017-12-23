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
        return this.$store.getters.instruments;
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
