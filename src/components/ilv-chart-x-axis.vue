<template>
  <g class="x-axis">
    <g
      v-for="(phase, index) in phases"
      :key="`phase-${phase.id}`"
      :transform="`translate(${phase.x}, ${phase.y})`"
      class="x-axis-tic"
    >
      <path v-if="index !== 0" d="M0,20 L5,30 0,40" fill="none" stroke="#000"></path>
      <foreignObject :width="phase.width" :height="chart.spacing">
        <body xmlns="http://www.w3.org/1999/xhtml">
          <div class="phase-text">
            <span v-html="$store.getters.term(phase)"></span>
          </div>
        </body>
      </foreignObject>
    </g>
  </g>
</template>

<script>
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
        return item
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .x-axis-tic {
    body {
      width: 100%;
      height: 100%;
    }
    .phase-text {
      display: table;
      text-align: center;
      padding: 0.5rem 1rem;
      line-height: 1.2;
      font-weight: bold;
      font-size: 0.93rem;
      height: 100%;
      width: 100%;

      span {
        display: table-cell;
        vertical-align: middle;
      }
    }
  }
</style>
