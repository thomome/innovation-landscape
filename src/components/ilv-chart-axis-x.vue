<template>
  <g class="axis">
    <g class="label" v-for="i in axisTics" :key="i" :transform="transform(i)">
      <path class="tic" d="M0,1 L-10,1"></path>
      <path class="grid" d="M0,1 L600,1"></path>
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
      axisTics() {
        return this.$store.state.chart.axisTics
      },
      axisSpace() {
        return this.$store.state.chart.axisSpace
      },
      axisMax() {
        return this.$store.state.chart.axisMax
      },
      axisUnit() {
        return this.$store.state.chart.axisUnit
      },
      chartHeight() {
        return this.$store.state.chart.height
      }
    },
    methods: {
      transform(i){
        const x = this.axisSpace
        const y = (this.axisTics-i)*(this.chartHeight-this.axisSpace)/this.axisTics
        return `translate(${x}, ${y})`
      },
      label(i){
        return roundNumber(Math.round(this.axisMax/this.axisTics*i/Math.pow(10, this.axisUnit-2))*0.01, 2)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .label {
    transition: all 0.3s;

    .tic {
      stroke: #000;
    }
    .grid {
      opacity: 0;
      stroke-width: 1;
      stroke: #ccc;
      stroke-dasharray: 5;
      shape-rendering:crispEdges;
    }
  }
</style>
