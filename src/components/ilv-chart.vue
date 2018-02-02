<template>
  <div class="chart-container" ref="chart">
    <svg width="100%" height="500px" ref="chart" :viewBox="viewBox">
      <ilv-chart-y-axis
        :chart="chart"
      ></ilv-chart-y-axis>
      <ilv-chart-x-axis
        :chart="chart"
      ></ilv-chart-x-axis>
      <g class="data">
        <transition-group name="fade2" tag="g">
          <ilv-chart-bar
            v-for="instrument in instrumentAvailable"
            :key="'instrument-' + instrument.id"
            :instrument="instrument"
            :chart="chart"
          ></ilv-chart-bar>
        </transition-group>
      </g>
    </svg>
  </div>
</template>

<script>
  import BezierEasing from 'bezier-easing'
  import { intersect } from './../util.js'
  import { mapGetters } from 'vuex'
  import ilvChartBar from './ilv-chart-bar.vue'
  import ilvChartYAxis from './ilv-chart-y-axis.vue'
  import ilvChartXAxis from './ilv-chart-x-axis.vue'


  export default {
    data() {
      return {
        activeId: null,
        zoom: 1,
        size: {
          width: 0,
          height: 0
        },
        max: 1,
        spacing: 60,
        units: [
          { label: '', start: 0 },
          { label: 'thousand', start: 3 },
          { label: 'million', start: 6 },
          { label: 'billion', start: 9 },
          { label: 'trillion', start: 12 }
        ],
        easing: BezierEasing(0,0,.58,1),
        duration: 600,
        animation: null
      }
    },
    components: {
      ilvChartBar, ilvChartYAxis, ilvChartXAxis
    },
    computed: {
      ...mapGetters([ 'instrumentAvailable' ]),
      viewBox() {
        return `0 0 ${this.size.width} ${this.size.height}`
      },
      maxFromRaw() {
        const instruments = this.instrumentAvailable
        const typeSelected = this.$store.getters.typeSelected
        let maxAmount = 0
        instruments.forEach(v => {
          v.budget.forEach(b => {
            if(intersect(b.typeIds, typeSelected).length !== 0){
              if(b.amount > maxAmount) maxAmount = b.amount
            }
          })
        })
        this.zoom = 1
        if(maxAmount === 0) {
          maxAmount = 10000000
          this.max = 10000000
        }
        return maxAmount*1.5
      },
      maxWithZoom() {
        let max = this.maxFromRaw*this.zoom
        if(max < 100) max = 100
        if(max > 1000000000000) max = 1000000000000
        return max
      },
      unit() {
        let unit = {}
        this.units.some((v, i) => {
          const place =  Math.floor(this.max/Math.pow(10, v.start))
          if(place >= 1){
            unit = v
          }
        })
        return unit
      },
      chart() {
        return {
          size: this.size,
          zoom: this.zoom,
          spacing: this.spacing,
          max: parseInt(this.max),
          absoluteMax: parseInt(this.maxFromRaw),
          yScale: (this.size.height-this.spacing)/this.max,
          xScale: 1/this.$store.state.phase.list.length,
          unit: this.unit
        }
      }
    },
    watch: {
      maxWithZoom: function(newVal) {
        const start = Date.now()
        const vm = this
        const lastVal = vm.max;
        this.animation = function () {
          const progress = 1/vm.duration*(Date.now() - start)
          const ease = vm.easing(progress)
          vm.max = lastVal + ((newVal - lastVal) * ease)

          if(progress < 1) {
            requestAnimationFrame(vm.animation)
          } else {
            vm.max = newVal
          }
        }

        this.animation()
      }
    },
    methods: {
      updateSize() {
        this.size.width = this.$refs.chart.clientWidth || this.$refs.chart.parentNode.clientWidth
        this.size.height = this.$refs.chart.clientHeight || this.$refs.chart.parentNode.clientHeight
      }
    },
    mounted: function () {
      this.updateSize()
      window.addEventListener('resize', this.updateSize)
      this.$refs.chart.addEventListener('wheel', (e) => {
        const mult = e.deltaY < 0 ? -1 : 1
        this.zoom += (this.zoom*0.1*mult)
      })

      this.eventHub.$on('tooltip-enter', id => {
        this.activeId = id
      })
      this.eventHub.$on('tooltip-leave', () => {
        this.activeId = null
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
    padding-bottom: 75%;
    overflow: hidden;

    svg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }

  .fade2-enter-active, .fade2-leave-active {
    transition: transform .5s;
    transform-origin: center bottom;
    transform-box: fill-box;
  }
  .fade2-enter, .fade2-leave-to {
    transform: scale(1, 0)
  }
</style>
