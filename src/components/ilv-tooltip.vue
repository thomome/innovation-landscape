<template>
  <transition name="fade">
    <div
      v-if="active"
      ref="tooltip"
      class="tooltip-container"
      :style="{
        transform: 'translate('+(pos.x)+'px,'+pos.y+'px)',
        marginLeft: offset.x + 'px'
      }"
    >
      <div class="tooltip">
        <div class="tooltip-title">{{ instrument.institution }} {{ instrument.instrument }}</div>
        <div class="tooltip-lead">{{ lead }}</div>
        <div v-for="budget in budgetItems" :key="`${instrument.id}-${budget.typeIds.join(',')}`">
          <div class="tooltip-budget-bar">
            <div class="tooltip-budget-bar-fill" :style="{
              width: `${100/budgetItems[0].amount*budget.amount}%`,
              background: budget.background
            }"></div>
          </div>
          <div class="tooltip-budget-description">
            <span class="tooltip-budget-name">
              {{ term('budget') }} | <strong>{{ budget.typeString }}</strong>
            </span>
            <span class="tooltip-budget-amount">
              {{ formatAmount(budget.amount) }} {{ term('francs_short') }}<sup>{{ budget.sourceIndex }}</sup>
            </span>
          </div>
        </div>
        <div class="tooltip-data-source">
          <div v-for="budget in sourceItems" v-if="budget.source" :key="`${instrument.id}-${budget.typeIds.join(',')}-source`" class="tooltip-data-source-item">
            <span class="source-number">{{ budget.sourceIndex }}</span> <span class="source-text">{{ budget.source }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { formatAmount, intersect } from './../util.js'

export default {
  data() {
    return {
      instrumentId: null,
      pos: { x: 10, y: 10 },
      offset: { x: 0, y: 0 },
      patternSize: 5
    }
  },
  computed: {
    active() {
      return this.instrumentId !== null
    },
    instrument() {
      return this.$store.state.instrument.data[this.instrumentId]
    },
    budgetItemsSorted() {
      const budgetItems = this.instrument.budget.map(v => v)
      budgetItems.sort((a, b) => {
        return a.amount == b.amount ? a.typeIds[0] - b.typeIds[0] : b.amount - a.amount
      })
      let sourceIndex = 0
      budgetItems.map(v => {
        if(v.source) {
          sourceIndex++
          v.sourceIndex = sourceIndex
        } else {
          v.sourceIndex = 1
        }
        return v
      })
      return budgetItems
    },
    sourceItems() {
      let withoutSource = 0
      let totalAlreadyIn = false
      const sourceItems = this.budgetItemsSorted.filter((v,i) => {
        if(intersect(v.typeIds, this.$store.getters.typeSelected).length !== 0) {
          if(!v.source) withoutSource++
          if(i === 0) totalAlreadyIn = true
          return true
        }
      })
      if(withoutSource > 0 && !totalAlreadyIn) {
        sourceItems.unshift(this.budgetItemsSorted[0])
      }
      return sourceItems
    },
    budgetItemsFiltered() {
      return this.budgetItemsSorted.filter((v) => {
        return intersect(v.typeIds, this.$store.getters.typeSelected).length !== 0
      })
    },
    budgetItems() {
      const budgetItems = this.budgetItemsFiltered.map((v) => {
        const item = v
        item.typeString = v.typeIds.map(id => this.term(this.$store.state.type.data[id])).join('/')
        if(v.typeIds.length === 1) {
          item.background = this.$store.state.type.data[v.typeIds[0]].color
        } else {
          const gradientArray = []
          v.typeIds.forEach((id, index) => {
            const color = this.$store.state.type.data[id].color
            gradientArray.push(`${color} ${index*this.patternSize}px`)
            gradientArray.push(`${color} ${(index+1)*this.patternSize}px`)
          })
          const gradient = `repeating-linear-gradient(30deg, ${gradientArray.join(', ')})`
          item.background = gradient
        }
        return item
      })
      return budgetItems
    },
    lead() {
      return this.term(this.$store.state.region.data[this.instrument.regionId]) + ' » ' + this.instrument.categoryIds.map(id => this.term(this.$store.state.category.data[id])).join(', ')
    }
  },
  methods: {
    formatAmount: formatAmount,
    term(obj) {
      return this.$store.getters.term(obj)
    }
  },
  mounted() {
    window.addEventListener('mousemove', (e) => {
      if(this.active) {
        if(this.$refs.tooltip) {
          const appWidth = this.$root.$el.clientWidth
          const width = this.$refs.tooltip.clientWidth
          if(e.pageX + width > appWidth) {
            this.offset.x = (e.pageX + width - appWidth) * -1
          } else {
            this.offset.x = 0
          }
        }
        this.pos.x = e.pageX
        this.pos.y = e.pageY
      }
    })
    this.eventHub.$on('tooltip-enter', id => {
      this.instrumentId = id
    })
    this.eventHub.$on('tooltip-leave', () => {
      this.instrumentId = null
    })
  }
}
</script>

<style lang="scss" scoped>

  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
    .tooltip {
      transition: transform .2s;
    }
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;

    .tooltip {
      transform: translate(0, 10px);
    }
  }

  .tooltip-container {
    z-index: 1000000;
    position: absolute;
    left: 0;
    top: 0;
    margin-left: 15px;
    margin-top: 30px;
    min-width: 300px;
    max-width: 400px;

    .tooltip {
      position: relative;
      padding: 20px;
      background: #fff;
      border: 2px solid #efefef;
      box-shadow: 2px 5px 10px rgba(0,0,0,0.2);

      .tooltip-title {
        font-size: 1.28rem;
        font-weight: bold;
        line-height: 1;
      }
      .tooltip-lead {
        font-size: 1rem;
        color: #666;
        margin-bottom: 1rem;
      }
      .tooltip-budget-description {
        display: flex;
        width: 100%;
        margin-bottom: 0.7rem;

        .tooltip-budget-name {
          margin-right: 1rem;
        }
        .tooltip-budget-amount {
          font-weight: bold;
          margin-left: auto;

          sup {
            font-weight: normal;
          }
        }
      }
      .tooltip-budget-bar {
        position: relative;
        width: 100%;
        height: 3px;
        background: #efefef;
        margin-bottom: 1px;

        .tooltip-budget-bar-fill {
          background: #000;
          min-height: 100%;
        }
      }
      .tooltip-data-source {
        position: relative;
        margin-top: 1.5rem;
        padding-top: 3px;
        font-size: 0.85rem;
        font-style: italic;

        &::before {
          content: '';
          left: 0;
          top: 0;
          position: absolute;
          display: block;
          width: 1.5rem;
          height: 1px;
          background: #000;
        }

        .tooltip-data-source-item {
          display: flex;
          margin-top: 3px;

          .source-number {
            font-style: normal;
            margin-right: 5px;
          }
        }
      }
    }
  }

</style>
