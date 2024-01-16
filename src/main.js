import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import '@/styles/index.scss' // global css
import '@/styles/element-variables.scss' // Element-UI 组件全局样式自定义
import 'element-ui/lib/theme-chalk/icon.css' // Element-UI 图标乱码解决方案

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import '@/components' // global components

Vue.use(ElementUI, { size: 'medium' })

// 全局挂载axios封装
import service from '@/utils/request'
Vue.prototype.$http = service

// 全局使用dayjs
import dayjs from 'dayjs'
Vue.prototype.$dayjs = dayjs

// 过滤器
import * as filters from '@/filters'
// 注册全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 注册vue-amap
import VueAMap from '@vuemap/vue-amap'
import '@vuemap/vue-amap/dist/style.css'
Vue.use(VueAMap)
VueAMap.initAMapApiLoader({
  key: 'd8a18e2db0101a9c63c8e15b2b460400',
  plugin: [
    'AMap.Geolocation', // 定位空间，用来获取和展示用户主机所在的经纬度位置
    'AMap.Autocomplete', // 输入提示插件
    'AMap.PlaceSearch', // POI搜索插件
    'AMap.Scale', // 右下角缩略图插件，比例尺
    'AMap.OverView', // 地图鹰眼插件
    'AMap.ToolBar', // 地图工具条
    'AMap.MapType', // 类别切换空间，实现默认图层与卫星图，实施交通层之间切换的控制
    // 'AMap.PolyEditor', // 编辑 折线多边形
    // 'AMap.CircleEditor',
    'AMap.Geocoder'
  ],
  v: '1.4.1',
  securityJsCode: 'f2ef102a17a12a1a788900640f3c92c2'
})
/** mapmost的授权码 */
Vue.prototype.$mapMostUserId = '82a8e80a758f71de99b0e1a223fc00247fc637d571ad90e020d4cf055a2a6854'
Vue.prototype.$mapMostStyle = 'https://www.mapmost.com/cdn/styles/sample_data.json'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
