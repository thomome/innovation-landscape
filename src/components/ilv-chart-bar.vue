<template>
  <g>
    <g @click="openWebsite" @mouseenter="openTooltip" @mouseleave="closeTooltip" class="bar">
      <text v-if="labelPos" x="0" y="0" class="bar-label" :transform="`translate(${labelPos.x}, ${labelPos.y}) rotate(${labelRot})`">
        <tspan x="10" dy="1.2em" style="font-weight: bold">{{ instrument.institution }} {{ instrument.instrument }}</tspan>
        <tspan x="10" dy="1.2em" style="">{{ formatAmount(instrument.budget[0].amount, 6, 0, 'Fr. ', ' Mio.') }}</tspan>
      </text>
      <defs v-if="pattern">
        <pattern
          class="fill-pattern"
          :id="`instrument-${instrument.id}`"
          x="0"
          y="0"
          :width="pattern.size"
          :height="pattern.size"
          patternUnits="userSpaceOnUse"
        >
          <g :transform="`
            rotate(${pattern.angle}, ${pattern.size*0.5}, ${pattern.size*0.5})
            translate(${(pattern.diagonal-pattern.size)*-0.5},${(pattern.diagonal-pattern.size)*-0.5})
          `">
            <rect
              v-for="item in pattern.items"
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
  import { intersect, formatAmount } from './../util.js'
  import ilvChartBarPeak from './ilv-chart-bar-peak.vue'

  export default {
    components: { ilvChartBarPeak },
    props: ['instrument', 'instrumentIndex', 'chart'],
    data () {
      return {
        patternStripeWidth: 7
      }
    },
    computed: {
      labelRot() {
        let rotation = ((this.$store.getters.instrumentAvailable.length-1) * 5) + 60
        if(rotation > 90) rotation = 90
        return rotation*-1
      },
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
            y: y
          }
        } else {
          return false
        }
      },
      budgetItems() {
        const typeSelected = this.$store.getters.typeSelected
        const filteredBudgetItems = this.instrument.budget.filter(v => {
          return intersect(typeSelected, v.typeIds).length !== 0
        })
        return filteredBudgetItems.sort((a,b) => { return (a.amount - b.amount) * -1 })
      },
      pattern() {
        const cats = this.$store.state.category.data
        const ids = this.instrument.categoryIds
        if(ids.length > 1) {
          let index = 0
          const patternSize = Math.sqrt(Math.pow(ids.length*this.patternStripeWidth*2,2)*0.5)
          const patternDiagonal = ids.length*this.patternStripeWidth*2
          const patternItems = []
          const patternAngle = this.instrument.angle*45
          for(let i = 0; i < 2; i++){
            ids.forEach(id => {
              let color = Color(cats[id].color)

              color = color.darken(this.instrument.shade*0.2)
              patternItems.push({
                color: color.rgb().string(),
                y: index*this.patternStripeWidth,
                h: this.patternStripeWidth,
                w: patternSize*2
              })
              index++
            })
          }
          const pattern = {
            items: patternItems,
            size: patternSize,
            diagonal: patternDiagonal,
            angle: patternAngle
          }
          return pattern
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
      formatAmount: formatAmount,
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
  .bar-label {
    font-size: 1rem;
  }
  .bar {
    opacity: 0.95;
    shape-rendering: auto;
    cursor: pointer;

    &:hover {
      opacity: 1;

      .main {
        stroke: rgba(0,0,0,1);
      }
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
