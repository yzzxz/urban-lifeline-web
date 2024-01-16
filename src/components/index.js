import Vue from 'vue'

import DictSelect from '@/components/DictSelect/index.vue'

import TreeSelect from '@/components/TreeSelect/index.vue'

import OrgTreeSelect from '@/components/OrgTreeSelect.vue'
// 注册全局组件
Vue.component('DictSelect', DictSelect)
Vue.component('TreeSelect', TreeSelect)
Vue.component('OrgTreeSelect', OrgTreeSelect)

// 导出Vue实例
export default Vue
