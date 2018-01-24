<template>
  <div class="chart-container">
    <svg width="100%" height="500px" ref="chart" :viewBox="viewBox">
      <ilv-chart-y-axis
        :chart="chart"
      ></ilv-chart-y-axis>
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
  import TWEEN from '@tweenjs/tween.js'
  import { intersect } from './../util.js'
  import { mapGetters } from 'vuex'
  import ilvChartBar from './ilv-chart-bar.vue'
  import ilvChartYAxis from './ilv-chart-y-axis.vue'


  export default {
    data() {
      return {
        zoom: 1,
        size: {
          width: 0,
          height: 0
        },
        max: 0,
        spacing: 60,
        units: [
          { label: '', start: 0 },
          { label: 'thousand', start: 3 },
          { label: 'million', start: 6 },
          { label: 'billion', start: 9 },
          { label: 'trillion', start: 12 }
        ],
        animation: null
      }
    },
    components: {
      ilvChartBar, ilvChartYAxis
    },
    computed: {
      ...mapGetters([ 'instrumentAvailable' ]),
      viewBox() {
        return `0 0 ${this.size.width} ${this.size.height}`
      },
      maxFromRaw() {
        const instruments = this.instrumentAvailable
        const categorySelected = this.$store.state.category.selected
        let maxAmount = 0
        instruments.forEach(v => {
          if(categorySelected.length === 0) {
            if(v.budget.total > maxAmount) maxAmount = v.budget.total
          } else {
            v.budget.items.forEach(b => {
              if(intersect(b.categoryIds, categorySelected).length !== 0){
                if(b.amount > maxAmount) maxAmount = b.amount
              }
            })
          }
        })
        this.zoom = 1
        return maxAmount
      },
      maxWithZoom() {
        return this.maxFromRaw*this.zoom
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
          unit: this.unit
        }
      }
    },
    watch: {
      /*maxWithZoom: function(newVal, oldVal) {
        var vm = this
        function animate () {
          if (TWEEN.update()) {
            requestAnimationFrame(animate)
          }
        }

        new TWEEN.Tween({ tweeningNumber: oldVal })
          .easing(TWEEN.Easing.Cubic.InOut)
          .interpolation(TWEEN.Interpolation.Bezier)
          .to({ tweeningNumber: newVal }, 400)
          .onUpdate(function ({tweeningNumber}) {
            vm.max = tweeningNumber.toFixed(0)
          })
          .start()

        animate()
      },*/
      maxWithZoom: function(newVal) {
        const vm = this
        const lastVal = vm.max;
        this.animation = function () {
          vm.max = vm.max + ((newVal - vm.max) * 0.1)

          if(Math.round(500/newVal * vm.max ) !== 500) {
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
      document.body.addEventListener('wheel', (e) => {
        const mult = e.deltaY < 0 ? -1 : 1
        this.zoom += (this.zoom*0.1*mult)
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

  .fade2-enter-active, .fade2-leave-active {
    transition: transform .5s;
    transform-origin: center bottom;
  }
  .fade2-enter, .fade2-leave-to {
    transform: scale(1, 0)
  }
</style>
