<template>
  <el-select ref="selectTree" v-model="value" class="main-select-tree" popper-append-to-body>
    <el-option v-for="item in options" :key="item.value" :label="item[treeDefaultProps.label]" :value="item.id" style="display: none;" />
    <el-tree ref="select-tree" class="main-select-el-tree"
             :data="treeData"
             node-key="id"
             highlight-current
             :props="treeDefaultProps"
             :current-node-key="value"
             :expand-on-click-node="expandOnClickNode"
             @node-click="handleNodeClick" />
  </el-select>

</template>

<script>
import { untieTree } from '@/utils'

export default {
  name: 'TreeSelect',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: {
      type: Boolean,
      default: false
    },

    clearable: {
      type: Boolean,
      default: false
    },
    dropdownUrl: {
      type: String,
      default: ''
    },
    dropdownParams: {
      type: Object,
      default: () => { return {} }
    },
    treeDefaultProps: {
      type: Object,
      default: () => {
        return {
          children: 'children',
          label: 'label'
        }
      }
    },
    expandOnClickNode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      treeData: []
    }
  },
  computed: {
    options() {
      return untieTree(this.treeData)
    }
  },
  watch: {
    dropdownUrl: {
      handler() {
        this.initTreeData()
      },
      immediate: true
    }

  },
  created() {

  },
  methods: {
    // 获取下拉数据
    initTreeData() {
      this.treeData = []
      if (!this.dropdownUrl) {
        return
      }
      // 根据指定dropdown url 或 dict_code, 初始化字典数组
      this.$http({
        url: this.dropdownUrl,
        method: 'get',
        params: this.dropdownParams
      }).then(res => {
        if (res.code === 1 && res.data) {
          if (res.data) {
            this.treeData = res.data
          }
        }
      })
    },

    handleNodeClick(node) {
      this.value = node.id
      this.$refs['select-tree']?.blur()

      this.$emit('change', node.id)
      this.$emit('input', node.id)
    }
  }
}
</script>
<style>
.main-select-el-tree .el-tree-node .is-current > .el-tree-node__content{font-weight: bold; color: #4279e4;}
.main-select-el-tree .el-tree-node.is-current > .el-tree-node__content{font-weight: bold; color: #4279e4;}
</style>
