<template>
  <transition name="fade">
    <div v-if="active" ref="tooltip" class="tooltip-container" :style="{ transform: 'translate('+(pos.x+offset.x)+'px,'+pos.y+'px)' }">
      <div class="tooltip">
        <h6 class="title">{{ instrument.institution }}<span v-if="instrument.institution">:</span> {{ instrument.instrument }}</h6>
        <span class="subheadingfont">{{ instrument.categoryIds.map(id => $store.state.category.data[id].en).join(', ')  }}</span>
        <h4>Budget</h4>
        <div v-for="budget in instrument.budget" :key="`${instrument.id}-${budget.typeIds.join(',')}`">
          {{ budget.typeIds.map(id => $store.state.type.data[id].en).join('/') }}: {{ budget.amount }} Fr.
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      instrumentId: null,
      pos: { x: 10, y: 10 },
      offset: { x: 0, y: 0 }
    }
  },
  computed: {
    active() {
      return this.instrumentId !== null
    },
    instrument() {
      return this.$store.state.instrument.data[this.instrumentId]
    }
  },
  mounted() {
    window.addEventListener('mousemove', (e) => {
      if(this.active) {
        if(this.$refs.tooltip) {
          const width = this.$refs.tooltip.clientWidth
          if(e.pageX + width > document.body.clientWidth) {
            this.offset.x = width * -1
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
    position: absolute;
    margin-left: 15px;
    margin-top: 30px;

    .tooltip {
      padding: 20px;
      background: #fff;
      border: 2px solid #efefef;
      box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    }
  }

</style>
