<template>
  <g>
      <ilv-chart-bar-peak
        v-for="(budget, index) in budgetItems"
        :key="`${instrument.id}-${budget.categoryIds.join('-')}`"
        :from="instrument.from"
        :to="instrument.to"
        :budget="budget"
        :index="index"
        :layer="instrument.id"
      ></ilv-chart-bar-peak>
  </g>
</template>

<script>
  import { intersect } from './../util.js'
  import ilvChartBarPeak from './ilv-chart-bar-peak.vue'

  export default {
    components: { ilvChartBarPeak },
    props: ['instrument', 'instrumentIndex'],
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

</style>
