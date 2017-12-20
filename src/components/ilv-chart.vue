<template>
  <svg width="100%" height="500px" ref="chart">
    <g class="bars">
      <ilv-chart-bar from="0" to="250" amount="250"></ilv-chart-bar>
    </g>
  </svg>
</template>

<script>
  import ilvChartBar from './ilv-chart-bar.vue'

  export default {
    components: {
      ilvChartBar
    },
    data () {
      return {}
    }
  }
</script>
