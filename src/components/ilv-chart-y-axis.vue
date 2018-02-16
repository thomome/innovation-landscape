<template>
  <g class="y-axis">
    <text
      class="legend"
      x="0"
      y="0"
      :transform="legendTransform"
      style="font-size: 0.93rem; alignment-baseline: middle; text-anchor: middle; font-weight: bold;"
    >
      {{ legendText }}
    </text>
    <g
      class="label"
      v-for="tic in tics"
      :key="tic.id"
      :transform="`translate(${tic.x} ${tic.y})`"
      style="font-size: 0.93rem;"
    >
      <path
        class="tic"
        d="M0,1 L-10,1"
        stroke="#000"
      ></path>
      <path
        class="grid"
        :d="`M0,1 L${chart.size.width-chart.spacing},1`"
        stroke="#000"
        style="stroke-width: 0.15; stroke-dasharray: 3;"
      ></path>
      <text class="text" x="-2" y="6" text-anchor="end" dominant-baseline="hanging">
        {{ tic.number }}
      </text>
    </g>
  </g>
</template>

<script>
  import { roundNumber } from './../util.js'

  export default {
    props: ['chart'],
    data () {
      return {
        label: 'mio'
      }
    },
    computed: {
      tics() {
        const axis = this.axis
        const tics = []
        for (let i = 0; i < this.chart.max*1.3; i += axis.ticSize) {
          tics.push({
            id: `${i}-${this.label}`,
            number: roundNumber(i * Math.pow(10, this.chart.unit.start * -1), 2),
            x: this.chart.spacing,
            y: (this.chart.size.height-this.chart.spacing) - ((this.chart.size.height-this.chart.spacing) / this.chart.max * i)
          })
        }
        return tics
      },
      axis() {
        const dividers = [25,20,10,5,2.5,2,1]
        const maxValue = this.chart.max
        const maxValueLength = parseInt(maxValue).toString().length

        const maxUnitValue = (maxValue * Math.pow(10, (maxValueLength-2)*-1))

        let divider = null
        let steps = null

        dividers.some(v => {
          const tempMaxValue = (Math.ceil(maxUnitValue * (1/v)) / (1/v)).toFixed(2)
          const multiplier = tempMaxValue / v
          if(multiplier < 10) {
            divider = v
            steps = multiplier
          } else {
            return true
          }
        })

        return { ticSize: divider * Math.pow(10, maxValueLength-2), ticCount: steps }
      },
      legendTransform() {
        const top = (this.chart.size.height - this.chart.spacing)*0.5
        const left = this.chart.spacing*0.33;
        return `translate(${left} ${top}) rotate(-90)`
      },
      legendText() {
        return `${this.term('in')} ${this.term(this.chart.unit.label)} ${this.term('francs')}`
      }
    },
    methods: {
      term(obj) {
        return this.$store.getters.term(obj)
      }
    }
  }
</script>
