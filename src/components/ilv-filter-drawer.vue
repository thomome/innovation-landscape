<template>
  <v-layout row wrap justify-end class="filter-drawer">

    <v-flex xs8 sm8>
      <div class="text-xs-left">
        <v-btn small color="primary" @click="exportData()">{{ term('export_data') }} (CSV)</v-btn>
        <v-btn small color="secondary" @click="exportChart()">{{ term('save_graph') }} (SVG)</v-btn>
      </div>
    </v-flex>

    <v-flex xs4 sm4>
      <div class="text-xs-right">
        <v-btn outline small @click="extended = !extended">{{ term('filter') }} <v-icon right>{{ extended ? 'arrow_drop_up' : 'arrow_drop_down' }}</v-icon></v-btn>
      </div>
    </v-flex>


    <v-layout row wrap v-show="extended" class="extendable-filter">
      <v-flex xs12 sm12 pa-1>
        <v-select
          class="select-box"
          :label="term('instruments')"
          v-bind:items="instrumentOption"
          v-model="instrumentSelected"
          multiple
          autocomplete
          clearable
          dense
        ></v-select>
      </v-flex>

      <v-flex xs12 sm4 pa-1>
        <v-subheader class="filter-header">{{ term('region') }}</v-subheader>
        <v-checkbox
          v-for="opt in regionOption" :key="`reg-${opt.value}`"
          :label="opt.text"
          :value="opt.value"
          v-model="regionSelected"
          color="primary"
          hide-details
        ></v-checkbox>
      </v-flex>

      <v-flex xs12 sm4 pa-1>
        <v-subheader class="filter-header">{{ term('category') }}</v-subheader>
        <v-checkbox
          v-for="opt in categoryOption" :key="`cat-${opt.value}`"
          :label="opt.text"
          :value="opt.value"
          v-model="categorySelected"
          color="primary"
          hide-details
        ></v-checkbox>
      </v-flex>
      <v-flex xs12 sm4 pa-1>
        <v-subheader class="filter-header">{{ term('budget_item') }}</v-subheader>
        <v-checkbox
          v-for="opt in typeOption" :key="`typ-${opt.value}`"
          :label="opt.text"
          :value="opt.value"
          v-model="typeSelected"
          color="primary"
          hide-details
        ></v-checkbox>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
  import Papa from 'papaparse'
  import { setHashParams, saveAs, htmlDecode } from './../util.js'

  export default {
    data() {
      return {
        extended: false
      }
    },
    computed: {
      instrumentOption() {
        return this.$store.getters.instrumentAll.map(o => { return { text: this.term(o), value: o.id } })
      },
      instrumentSelected: {
        get: function() {
          return this.$store.state.instrument.selected
        },
        set: function(newVal) {
          this.$store.commit('setSelected', { table: 'instrument', data: newVal })
          this.hashChanging = true
          setHashParams('instrument', newVal.join(','))
          this.hashChanging = false
        }
      },
      categoryOption() {
        return this.$store.getters.categoryAll.map(o => { return { text: this.term(o), value: o.id } })
      },
      categorySelected: {
        get: function() {
          return this.$store.state.category.selected
        },
        set: function(newVal) {
          this.$store.commit('setSelected', { table: 'category', data: newVal })
          this.hashChanging = true
          setHashParams('category', newVal.join(','))
          this.hashChanging = false
        }
      },
      regionOption() {
        return this.$store.getters.regionAll.map(o => { return { text: this.term(o), value: o.id } })
      },
      regionSelected: {
        get: function() {
          return this.$store.state.region.selected
        },
        set: function(newVal) {
          this.$store.commit('setSelected', { table: 'region', data: newVal })
          this.hashChanging = true
          setHashParams('region', newVal.join(','))
          this.hashChanging = false
        }
      },
      typeOption() {
        return this.$store.getters.typeAll.map(o => { return { text: this.term(o), value: o.id } })
      },
      typeSelected: {
        get: function() {
          return this.$store.state.type.selected
        },
        set: function(newVal) {
          this.$store.commit('setSelected', { table: 'type', data: newVal })
          this.hashChanging = true
          setHashParams('type', newVal.join(','))
          this.hashChanging = false
        }
      }
    },
    methods: {
      exportChart() {
        this.eventHub.$emit('export-svg')
      },
      exportData() {
        const budgetTypes = {}
        const table = this.$store.getters.instrumentAvailable.map((v) => {
          const item = {}
          item[this.term('instrument')] = this.term(v)
          item[this.term('category')] = v.categoryIds.map(id => this.term(this.$store.state.category.data[id])).join(', ')
          item[this.term('region')] = this.term(this.$store.state.region.data[v.regionId])
          item[this.term('from')] = htmlDecode(this.term(this.$store.state.phase.data[Math.floor(v.from)]))
          item[this.term('to')] = htmlDecode(this.term(this.$store.state.phase.data[Math.floor(v.to)]))
          item[this.term('website')] = v.website
          v.budget.sort((a, b) => { return b.amount - a.amount })
          v.budget.forEach(b => {
            const id = this.term('budget') + ' ' + b.typeIds.map(id => this.term(this.$store.state.type.data[id])).join('/')
            budgetTypes[id] = true
            budgetTypes[id + ' - ' + this.term('source')] = true
            item[id] = b.amount
            item[id + ' - ' + this.term('source')] = b.source ? b.source : v.budget[0].source
          })
          return item
        })
        for(let index in budgetTypes) {
          if(!table[0][index]) table[0][index] = ""
        }
        if(table.length > 0) {
          const csv = Papa.unparse(table, {
            quotes: false,
            delimiter: ";"
          })
          const blob = new Blob([`\ufeff${csv}\r\n${this.term('source_message')}`], {type: "text/csv;charset=ANSI"})
          saveAs(blob, `${this.term('export_name')}.csv`);
        }
      },
      term(obj) {
        return this.$store.getters.term(obj)
      }
    },
    updated() {
      this.eventHub.$emit('app-resize')
    }
  }
</script>

<style lang="scss">
  .filter-drawer {
    margin-top: 1rem;

    .icon-button {
      .icon {
        margin-right: 1rem;
      }
    }
  }
  .extendable-filter {
    margin-top: 1rem;
    padding: 0.5rem;
    border-top: 1px solid #999;
  }
  .select-box {
    .input-group__details {
      min-height: 1rem;
    }
  }
  .filter-header {
    padding: 0 0 0.5rem 0;
    height: auto;
  }
</style>
