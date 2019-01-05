<template>
  <div id="app">
    <!--<img class="logo" src="./assets/logo.svg">-->
    <div class="table-container">
      <table-component
        :data="rawData"
        :show-filter="false"
        sort-by="songs"
        sort-order="asc"
        >
        <table-column
          v-for="(column, idx) in columns"
          :header-class="column.headerClass"
          :cell-class="column.class"
          :key="idx"
          :show="column.show"
          :label="column.label"
          :data-type="column.dataType"
          :sortable="column.sortable"
          :filterable="column.filterable"
          :formatter="column.formatter"
        />
      </table-component>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
      rawData: [],
      columns: [
        { show: 'name', label: 'Application Name', sortable: true, class: 'name-cell hoverable' },
        { show: 'year', label: 'KJ', sortable: true, filterable: true, dataType: 'numeric', class: 'numeric-cell year hoverable' },
        { show: 'opCosts', label: 'Betrieb', sortable: true, dataType: 'numeric', class: 'numeric-cell hoverable' },
        { show: 'projectCosts', label: 'Projekt', sortable: true, dataType: 'numeric', class: 'numeric-cell hoverable' },
        { show: 'totalCosts', label: 'Gesamt', sortable: true, dataType: 'numeric', class: 'numeric-cell hoverable' }
      ]
    }
  },
  methods: {
    getDataset () {
      const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023]
      const costTypes = ['project', 'op', 'total']
      const costFragment = years
        .map(year => `y${year}`).map(yearPrefix => costTypes.map(costType => `${yearPrefix}${costType}`))
        .reduce((accumulator, yearPrefix) => Array.from([...accumulator, ...yearPrefix.map(year => `${year}Costs`)]), [])
      const query = `{op:allFactSheets(factSheetType: Application){edges{node{...on Application{id name ${costFragment}}}}}}`
      this.$lx.executeGraphQL(query)
        .then(res => res.op.edges
          .map(edge => edge.node)
          .reduce((accumulator, node) => {
            const keyedByYear = years
              .map(year => Object
                .keys(node)
                .filter(key => key.indexOf(year) > -1)
                .reduce((accumulator, key) => {
                  accumulator[key.replace(`y${year}`, '')] = node[key]
                  return accumulator
                }, { id: node.id, name: node.name, year })
              )
            return Array.from([...accumulator, ...keyedByYear])
          }, [])
        )
        .then(res => {
          console.log('res', res)
          this.rawData = res
        })
    }
  },
  mounted () {
    this.$lx.init()
      .then(setup => {
        this.$lx.ready({})
      })
    this.getDataset()
  }
}
</script>

<style lang="stylus">
  @import './stylus/table-component'

  #app
    font-family: Helvetica Neue,Helvetica,Arial,sans-serif
    font-size: 12px
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
    color: #333
    display flex
    flex-flow column
    justify-content center
    align-items center

  .table-container
    display flex
    flex-flow column
    max-width 85%

  .name-cell
    max-width 350px
    white-space nowrap !important
    overflow hidden
    text-overflow ellipsis
    text-align center
    padding 0 20px !important

  .numeric-cell
    text-align right
    min-width 150px
  .year
    min-width 100px
    text-align center

</style>
