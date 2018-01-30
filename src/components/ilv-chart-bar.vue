<template>
  <g>
    <text v-if="labelPos" x="0" y="0" :transform="`translate(${labelPos.x}, ${labelPos.y}) rotate(-60)`">
      <tspan x="0" dy="1.2em">{{ instrument.institution }}</tspan>
      <tspan x="0" dy="1.2em" style="font-weight: bold">{{ instrument.instrument }}</tspan>
    </text>
    <g @click="openWebsite" @mouseenter="openTooltip" @mouseleave="closeTooltip" class="bar">
      <defs v-if="pattern">
        <pattern
          class="fill-pattern"
          :id="`instrument-${instrument.id}`"
          x="0"
          y="0"
          :width="patternSize"
          :height="patternSize"
          patternUnits="userSpaceOnUse"
        >
          <g transform="rotate(45)">
            <rect
              v-for="item in pattern"
              x="0"
              :y="item.y"
              :width="item.w"
              :height="item.h+0.1"
              :style="{ fill: item.color }"
            />
          </g>
        </pattern>
      </defs>
      <transition-group name="fade" tag="g">
        <ilv-chart-bar-peak
          v-for="(budget, index) in budgetItems"
          :key="`${instrument.id}-${budget.typeIds.join('-')}`"
          :from="instrument.from"
          :to="instrument.to"
          :budget="budget"
          :index="index"
          :chart="chart"
          :fill="fill"
        ></ilv-chart-bar-peak>
      </transition-group>
    </g>
  </g>
</template>

<script>
  import Color from 'color'
  import { intersect } from './../util.js'
  import ilvChartBarPeak from './ilv-chart-bar-peak.vue'

  export default {
    components: { ilvChartBarPeak },
    props: ['instrument', 'instrumentIndex', 'chart'],
    data () {
      return {
        patternSize: 15
      }
    },
    computed: {
      labelPos() {
        if(this.budgetItems[0]){
          const chart = this.chart
          const from = this.instrument.from
          const to = this.instrument.to
          const width = to - from
          const x = (((width)*0.5+from)*chart.xScale)*(chart.size.width-chart.spacing)+chart.spacing
          const y = chart.yScale === Infinity ? 0 : chart.size.height - chart.spacing - 10 - (this.budgetItems[0].amount*chart.yScale)
          return {
            x: x-10,
            y: y-10
          }
        } else {
          return false
        }
      },
      budgetItems() {
        const typeSelected = this.$store.state.type.selected
        const filteredBudgetItems = this.instrument.budget.filter(v => {
          return intersect(typeSelected, v.typeIds).length !== 0
        })
        return filteredBudgetItems.sort((a,b) => { return (a.amount - b.amount) * -1 })
      },
      pattern() {
        const cats = this.$store.state.category.data
        const ids = this.instrument.categoryIds
        if(ids.length > 1) {
          const patternItems = []
          const unit = Math.sqrt(Math.pow(this.patternSize, 2) + Math.pow(this.patternSize, 2))/(ids.length*2)
          ids.forEach((id, index) => {
            patternItems.push({
              color: cats[id].color,
              y: unit - (index * unit),
              h: unit,
              w: this.patternSize*2
            })
            patternItems.push({
              color: cats[id].color,
              y: unit - ((index + 2) * unit),
              h: unit,
              w: this.patternSize*2
            })
          })
          return patternItems
        } else {
          return false
        }
      },
      fill() {
        const ids = this.instrument.categoryIds
        if(ids.length > 1) {
          return `url(#instrument-${this.instrument.id})`
        } else if(ids.length === 1) {
          const cats = this.$store.state.category.data
          let color = Color(cats[ids[0]].color)
          color = color.darken(this.instrument.shade*0.2)
          return color.rgb().string()
        } else {
          return '#ffffff'
        }
      },
    },
    methods: {
      openTooltip() {
        this.eventHub.$emit('tooltip-enter', this.instrument.id)
      },
      closeTooltip() {
        this.eventHub.$emit('tooltip-leave')
      },
      openWebsite() {
        window.open(this.instrument.website)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .bar {
    opacity: 0.95;
    shape-rendering: auto;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
  .fill-pattern rect {
    stroke: none;
  }
  .fade-enter-active, .fade-leave-active {
    transition: transform .5s;
    transform-origin: center bottom;
    transform-box: fill-box;
  }
  .fade-enter, .fade-leave-to {
    transform: scale(1, 0)
  }
</style>
