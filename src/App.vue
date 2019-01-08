<template>
  <div id="app">
    <div class="actions-row"></div>
    <hot-table root="hotgrid" :settings="hotSettings" ref="hot" @click.native="handleClickEvent"/>
  </div>
</template>

<script>

import { HotTable } from '@handsontable/vue'

/*
const getCostFragment = () => {
  const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023]
  const costTypes = ['project', 'op', 'total']
  const costFragment = years
    .map(year => `y${year}`).map(yearPrefix => costTypes.map(costType => `${yearPrefix}${costType}`))
    .reduce((accumulator, yearPrefix) => Array.from([...accumulator, ...yearPrefix.map(year => `${year}Costs`)]), [])
  console.log('costFrahment', costFragment)
  return costFragment
}
*/

const linkRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  // const r = instance.getDataAtRow(row)
  if (value === null) return
  const uri = `/factsheet/Application/${value.id}`
  // this.$lx.openRouterLink(uri)
  td.innerHTML = `<a factsheet-uri="${uri}" class="factsheet-link" href="#">${value.name}</a>`
  td.style = 'text-align: center'
  return td
}

export default {
  name: 'App',
  components: {
    HotTable
  },
  data () {
    return {
      exportXLS: 0,
      dataset: {},
      filter: {},
      hotSettings: {
        columns: [
          {
            data: 'appID',
            type: 'text',
            renderer: linkRenderer,
            columnSorting: {
              compareFunctionFactory: (sortOrder, columnMeta) => {
                return function comparator (value, nextValue) {
                  const a = value.name
                  const b = nextValue.name
                  return sortOrder === 'asc' ? a.localeCompare(b) : sortOrder === 'desc' ? b.localeCompare(a) : 0
                }
              }
            }
          },
          { data: 'year', type: 'numeric' },
          { data: 'opCosts', type: 'numeric' },
          { data: 'projectCosts', type: 'numeric' },
          { data: 'totalCosts', type: 'numeric' }
        ],
        cells: (row, col, prop) => {
          const cellProperties = {}
          if (prop === 'year') {
            cellProperties.className = 'center-text'
          }
          return cellProperties
        },
        readOnly: true,
        stretchH: 'all',
        width: 806,
        autoWrapRow: true,
        height: 487,
        // maxRows: 22,
        manualRowResize: true,
        manualColumnResize: true,
        data: {},
        colHeaders: [ 'Applikation', 'KJ', 'Betrieb Kosten', 'Projekt Kosten', 'Gesamt Kosten' ],
        rowHeaders: false,
        hiddenColumns: {
          columns: [0],
          indicators: false
        },
        manualRowMove: false,
        manualColumnMove: false,
        contextMenu: false,
        columnSorting: {
          sortEmptyCells: false,
          initialConfig: {
            column: 0,
            sortOrder: 'asc'
          },
          indicator: true
        }
      }
    }
  },
  methods: {
    createReportConfig () {
      // const that = this
      return {
        allowTableView: false,
        menuActions: {
          showConfigure: false
        },
        facets: [
          {
            key: 'main',
            fixedFactSheetType: 'Application',
            defaultPageSize: 1,
            facetFiltersChangedCallback: filter => {
              this.filter = {
                facetFilters: filter.facets,
                fullTextSearch: filter.fullTextSearchTerm,
                ids: filter.directHits.map(hit => hit.id)
              }
            }
          }
        ]
      }
    },
    handleClickEvent (evt) {
      const { target } = evt
      const factSheetURI = target.getAttribute('factsheet-uri')
      if (factSheetURI) {
        this.$lx.openRouterLink(factSheetURI)
      }
    },
    resizeTable () {
      this.hotSettings.height = window.innerHeight - 43
      this.hotSettings.width = window.innerWidth - 40 > 860 ? 860 : window.innerWidth - 40
    },
    getDataset () {
      this.$lx.showSpinner()
      const variables = { filter: this.filter }
      const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023]
      const costTypes = ['project', 'op', 'total']
      const costFragment = years
        .map(year => `y${year}`).map(yearPrefix => costTypes.map(costType => `${yearPrefix}${costType}`))
        .reduce((accumulator, yearPrefix) => Array.from([...accumulator, ...yearPrefix.map(year => `${year}Costs`)]), [])
      const query = `query($filter: FilterInput){op:allFactSheets(filter: $filter){edges{node{...on Application{id name ${costFragment}}}}}}`
      this.$lx.executeGraphQL(query, variables)
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
                }, { id: node.id, name: node.name, appID: { id: node.id, name: node.name }, year })
              )
            return Array.from([...accumulator, ...keyedByYear])
          }, [])
        )
        .then(res => {
          this.$lx.hideSpinner()
          this.hotSettings.data = res
        })
    }
  },
  watch: {
    filter (val) {
      console.log('filter changed')
      this.getDataset()
    }
  },
  mounted () {
    this.resizeTable()
    this.$nextTick(() => window.addEventListener('resize', this.resizeTable))
    this.$lx.init().then(setup => this.$lx.ready(this.createReportConfig()))
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeTable)
  }
}
</script>

<style>
  @import 'handsontable/dist/handsontable.full.css';
</style>

<style lang="stylus">
  @import './stylus/table-component'

  .center-text
    text-align center !important

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
    padding 10px

</style>
