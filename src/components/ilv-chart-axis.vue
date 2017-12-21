<template>
  <g class="axis">
    <g class="label" v-for="i in labelAmount" :key="i" :transform="transform(i)">
      <path class="tic" d="M0,1 L-10,1"></path>
      <text class="text" x="-2" y="6" text-anchor="end" alignment-baseline="hanging">
        {{ label(i) }}
      </text>
    </g>
  </g>
</template>

<script>
  export default {
    props: ['data', 'direction'],
    data () {
      return {

      }
    },
    computed: {
      labelAmount() {

        const chartMaxAmount = this.$store.state.chart.maxAmount
        const length = chartMaxAmount.toString().length

        let rounded = Math.floor(chartMaxAmount/Math.pow(10, length-2))
        rounded = rounded/5
        if(rounded > 10) rounded = rounded/2
        return rounded
      }
    },
    methods: {
      transform(i){
        const axisSpace = this.$store.state.chart.axisSpace
        const chartWidth = this.$store.state.chart.width-axisSpace
        const chartHeight = this.$store.state.chart.height-axisSpace
        const chartMaxAmount = this.$store.state.chart.maxAmount

        const x = this.direction === 'x' ? (this.labelAmount-i)*chartWidth/this.labelAmount : axisSpace
        const y = this.direction === 'y' ? (this.labelAmount-i)*chartHeight/this.labelAmount : axisSpace
        return `translate(${x}, ${y})`
      },
      label(i){
        const chartMaxAmount = this.$store.state.chart.maxAmount
        return Math.round(chartMaxAmount/this.labelAmount*i/1000000)
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
  }
</style>
