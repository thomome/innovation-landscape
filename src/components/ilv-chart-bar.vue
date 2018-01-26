<template>
  <g>
    <transition-group name="fade" tag="g">
      <ilv-chart-bar-peak
        v-for="(budget, index) in budgetItems"
        :key="`${instrument.id}-${budget.categoryIds.join('-')}`"
        :from="instrument.from"
        :to="instrument.to"
        :budget="budget"
        :index="index"
        :layer="instrument.id"
        :chart="chart"
      ></ilv-chart-bar-peak>
    </transition-group>
  </g>

</template>

<script>
  import { intersect } from './../util.js'
  import ilvChartBarPeak from './ilv-chart-bar-peak.vue'

  export default {
    components: { ilvChartBarPeak },
    props: ['instrument', 'instrumentIndex', 'chart'],
    data () {
      return {

      }
    },
    computed: {
      budgetItems() {
        const categorySelected = this.$store.state.category.selected
        const filteredBudgetItems = this.instrument.budget.items.filter(v => {
          return intersect(categorySelected, v.categoryIds).length !== 0
        })
        return filteredBudgetItems.sort((a,b) => { return (a.amount - b.amount) * -1 })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .fade-enter-active, .fade-leave-active {
    transition: transform .5s;
    transform-origin: center bottom;
    transform-box: fill-box;
  }
  .fade-enter, .fade-leave-to {
    transform: scale(1, 0)
  }
</style>
