<template>
  <div class="chart-container">
    <svg width="100%" height="500px" ref="chart">
      <ilv-chart-y-axis direction="y"></ilv-chart-y-axis>
      <g class="bars">
        <transition-group tag="g" name="bars">
          <ilv-chart-bar
            v-for="inst in instruments"
            :key="'instrument-' + inst.id"
            :from="inst.from"
            :to="inst.to"
            :amount="inst.amount"
          ></ilv-chart-bar>
        </transition-group>
      </g>
    </svg>
  </div>
</template>

<script>
  import ilvChartBar from './ilv-chart-bar.vue'
  import ilvChartYAxis from './ilv-chart-y-axis.vue'


  export default {
    data() {
      return {}
    },
    components: {
      ilvChartBar, ilvChartYAxis
    },
    computed: {
      instruments() {
        return this.$store.getters.availableInstruments;
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
      document.body.addEventListener('wheel', (e) => {
        const mult = e.deltaY < 0 ? -1 : 1
        const zoom = this.$store.state.chart.zoom
        this.$store.commit('setChartZoom', {
          zoom: zoom + (zoom*0.1*mult)
        })
      })
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

  .bars-enter-active, .bars-leave-active {
    transition: transform .3s;
    transform-origin: center bottom;
  }
  .bars-enter, .bars-leave-to {
    transform: scaleY(0);
  }
</style>
