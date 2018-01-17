<template>
  <path v-if="amount > 0" :d="path" :fill="pathFill"></path>
</template>

<script>
  export default {
    props: ['from', 'to', 'amount'],
    data () {
      return {

      }
    },
    computed: {
      pathFill() {
        const max = this.$store.getters.yAxisMax
        const hue = this.amount/max*180
        return `hsla(${hue}, 25%, 50%, 1)`
      },
      path() {
        const axisSpace = this.$store.state.chart.axisSpace
        const chartWidth = this.$store.state.chart.width-axisSpace
        const chartHeight = this.$store.state.chart.height-axisSpace
        const yAxis = this.$store.getters.yAxis
        const xAxis = this.$store.getters.xAxis

        const yScale = chartHeight/yAxis.max
        const xScale = 1/this.$store.state.phase.list.length

        const from = parseInt(this.from)*xScale
        const to = parseInt(this.to)*xScale
        const amount = parseInt(this.amount)*yScale

        const w = (to-from)*chartWidth
        const x = axisSpace+(from*chartWidth)+(w*0.5)
        const h = amount
        const o = chartWidth/6
        const y = chartHeight

        const r = -0.861*(((h*o*0.5)/(h*w*0.5))-1)-0.3088*Math.pow(((h*o*0.5)/(h*w*0.5))-1, 3)

        let points = ''
        points += `M${ (x+w*0.5) },${ y } `
        points += `C${ r >= 0 ? (x+w*(1-r)*0.5) : (x+w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ r >= 0 ? x : (x-(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ x },${ (y-h) } `
        points += `C${ r >= 0 ? x : (x+(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ r >= 0 ? (x-w*(1-r)*0.5) : (x-w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ (x-w*0.5) },${ y }Z`

        return points
      }
    }
  }
</script>

<style lang="scss" scoped>
  path {
    opacity: 0.8;
    transition: all 0.3s, opacity 0.1s;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
</style>
