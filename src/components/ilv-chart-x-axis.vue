<template>
  <g class="x-axis">
    <g
      v-for="(phase, index) in phases"
      :key="`phase-${phase.id}`"
      :transform="`translate(${phase.x} ${phase.y})`"
      class="x-axis-tic"
    >
      <path
        v-if="index !== 0"
        d="M0,20 L5,30 0,40"
        fill="none"
        stroke="#000"
      ></path>
      <text
        class="phase-text"
        dominant-baseline="middle"
        :transform="`translate(${phase.width*0.5} ${chart.spacing*0.5})`"
      >
        <tspan
          v-for="(line, index2) in phase.lines"
          :key="`phase-line-${phase.id}-${index2}`"
          text-anchor="middle"
          x="0" :y="phase.start + (phase.lineHeight*index2)"
          style="font-weight: bold; font-size: 0.93rem;"
        >{{ line }}</tspan>
      </text>
    </g>
  </g>
</template>

<script>
import { formatText } from './../util.js'

export default {
  props: ['chart'],
  computed: {
    phases() {
      const phases = this.$store.getters.phaseAll
      const chart = this.chart
      return phases.map((v, i) => {
        const item = v
        item.x = chart.spacing + (i*((chart.size.width-chart.spacing)/phases.length))
        item.y = chart.size.height - (chart.spacing),
        item.width = (chart.size.width-chart.spacing)/phases.length
        item.lineHeight = 15
        item.lines = formatText(this.term(v), item.lineHeight, item.width*0.9)
        item.start = (item.lines.length*item.lineHeight-item.lineHeight)*-0.5
        return item
      })
    }
  },
  methods: {
    term(obj) {
      return this.$store.getters.term(obj)
    }
  }
}
</script>
