<template>
  <g class="axis">
    <text class="legend" x="0" y="0" :transform="legendTransform">
      {{ legendText }}
    </text>
    <g class="label" v-for="i in yAxis.tics" :key="key(i)" :transform="transform(i)">
      <path class="tic" d="M0,1 L-10,1"></path>
      <path class="grid" d="M0,1 L1500,1"></path>
      <text class="text" x="-2" y="6" text-anchor="end" alignment-baseline="hanging">
        {{ label(i) }}
      </text>
    </g>
  </g>
</template>

<script>
  import { roundNumber } from './../util.js'

  export default {
    data () {
      return {}
    },
    computed: {
      yAxis() {
        return this.$store.getters.yAxis
      },
      axisSpace() {
        return this.$store.state.chart.axisSpace
      },
      chartHeight() {
        return this.$store.state.chart.height
      },
      chartWidth() {
        return this.$store.state.chart.width
      },
      legendTransform() {
        const top = (this.chartHeight - this.axisSpace)*0.5
        const left = this.axisSpace*0.33;
        return `translate(${left} ${top}) rotate(-90)`
      },
      legendText() {
        return `In ${this.yAxis.unit.label} Franken`
      }
    },
    methods: {
      transform(i){
        const x = this.axisSpace
        const y = (this.yAxis.tics-i)*(this.chartHeight-this.axisSpace)/this.yAxis.tics
        return `translate(${x}, ${y})`
      },
      key(i) {
        return Math.round(this.yAxis.max/this.yAxis.tics*i)
      },
      label(i){
        return roundNumber(Math.round(this.yAxis.max/this.yAxis.tics*i/Math.pow(10, this.yAxis.unit.start - 2))*0.01, 2)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .legend {
    alignment-baseline: middle;
    text-anchor: middle;
    font-weight: 400;
    font-size: 1.15rem;
  }
  .label {
    transition: all 0.3s;

    .tic {
      stroke: #000;
    }
    .grid {
      opacity: 1;
      stroke-width: 1;
      stroke: #ddd;
      stroke-dasharray: 3;
      shape-rendering:crispEdges;
    }
  }
</style>
