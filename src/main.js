// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import LeanixVuePlugin from './plugins/LeanixVuePlugin'
import TableComponent from 'vue-tabl'

Vue.use(LeanixVuePlugin)
Vue.use(TableComponent)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
