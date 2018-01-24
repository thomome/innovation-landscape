<template>
  <div class="chart-container">
    <svg width="100%" height="500px" ref="chart" :viewBox="viewBox">
      <ilv-chart-y-axis></ilv-chart-y-axis>
      <g class="data">
        <transition-group tag="g" name="grow">
          <ilv-chart-bar
            v-for="instrument in instrumentAvailable"
            :key="'instrument-' + instrument.id"
            :instrument="instrument"
          ></ilv-chart-bar>
        </transition-group>
      </g>
    </svg>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
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
      ...mapGetters([ 'instrumentAvailable' ]),
      viewBox() {
        const chart = this.$store.state.chart
        return `0 0 ${chart.width} ${chart.height}`
      }
    },
    methods: {
      updateSize() {
        this.$store.commit('setChartDimension', {
          width: this.$refs.chart.clientWidth || this.$refs.chart.parentNode.clientWidth,
          height: this.$refs.chart.clientHeight || this.$refs.chart.parentNode.clientHeight
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
    overflow: hidden;

    svg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }

  .grow-enter-active, .grow-leave-active {
    transition: transform .3s;
    transform-origin: center bottom;
  }
  .grow-enter, .grow-leave-to {
    transform: scaleY(0);
  }
</style>
