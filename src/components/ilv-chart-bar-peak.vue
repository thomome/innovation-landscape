<template>
  <path
    :d="path"
    :fill="fill"
    :class="[!main ? 'outline' : 'main']"
  ></path>
</template>

<script>
  export default {
    props: ['from', 'to', 'budget', 'index', 'fill', 'chart'],
    data () {
      return {}
    },
    computed: {
      main() {
        return this.index === 0
      },
      path() {
        const chart = this.chart
        const chartWidth = chart.size.width - chart.spacing

        const from = this.from*chart.xScale
        const to = this.to*chart.xScale
        const amount = parseInt(this.budget.amount)*chart.yScale

        const w = (to-from)*chartWidth
        const x = chart.spacing+(from*chartWidth)+(w*0.5)
        const h = amount
        const o = chartWidth/6
        const y = chart.size.height - chart.spacing

        const r = -0.861*(((h*o*0.5)/(h*w*0.5))-1)-0.3088*Math.pow(((h*o*0.5)/(h*w*0.5))-1, 3)

        let points = ''
        points += `M${ (x+w*0.5) },${ y } L${ (x+w*0.5) },${ y-0.5 }`
        points += `C${ r >= 0 ? (x+w*(1-r)*0.5) : (x+w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ r >= 0 ? x : (x-(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ x+0.5 },${ (y-h) } L${ x },${ (y-h) } ${ x-0.5 },${ (y-h) }`
        points += `C${ r >= 0 ? x : (x+(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ r >= 0 ? (x-w*(1-r)*0.5) : (x-w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ (x-w*0.5) },${ y-0.5 } L${ (x-w*0.5) },${ y }`

        return points
      }
    }
  }
</script>

<style lang="scss" scoped>
  path {
    transition: stroke 0.2s;
    stroke: rgba(0,0,0,0);
    stroke-width: 1;
    opacity: 0.95;

    &.outline {
      transition: opacity 0.3s;
      opacity: 0.5;
      fill: rgba(0,0,0,0.1);
      stroke-dasharray: 3px 3px;
    }
  }
</style>
