<template>
  <path :d="path" :fill="color" :class="[!main ? 'outline' : '']"></path>
</template>

<script>
  import Color from 'color'

  export default {
    props: ['from', 'to', 'budget', 'index', 'layer'],
    data () {
      return {}
    },
    computed: {
      main() {
        return this.index === 0
      },
      color() {
        let color = false
        const cats = this.$store.state.category.data
        this.budget.categoryIds.forEach(v => {
          if(color){
            color = color.mix(Color(cats[v].color))
          } else {
            color = Color(cats[v].color)
          }
        })
        color = color.darken(this.layer*0.09)
        return color.rgb().string()
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
        const amount = parseInt(this.budget.amount)*yScale


        const w = (to-from)*chartWidth
        const x = axisSpace+(from*chartWidth)+(w*0.5)
        const h = amount
        const o = chartWidth/6
        const y = chartHeight

        const r = -0.861*(((h*o*0.5)/(h*w*0.5))-1)-0.3088*Math.pow(((h*o*0.5)/(h*w*0.5))-1, 3)

        let points = ''
        points += `M${ (x+w*0.5) },${ y } L${ (x+w*0.5) },${ y-0.5 }`
        points += `C${ r >= 0 ? (x+w*(1-r)*0.5) : (x+w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ r >= 0 ? x : (x-(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ x+0.5 },${ (y-h) } L${ x },${ (y-h) } ${ x-0.5 },${ (y-h) }`
        points += `C${ r >= 0 ? x : (x+(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ r >= 0 ? (x-w*(1-r)*0.5) : (x-w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ (x-w*0.5) },${ y-0.5 } L${ (x-w*0.5) },${ y }Z`

        return points
      }
    }
  }
</script>

<style lang="scss" scoped>
  path {
    opacity: 1;
    shape-rendering: auto;
    transition: all 0.3s, opacity 0.1s;
    cursor: pointer;

    &.outline {
      /*opacity: 0.3;
      stroke: #000;
      stroke-width: 1px;
      stroke-dasharray: 3px 3px;*/
    }
  }
</style>
