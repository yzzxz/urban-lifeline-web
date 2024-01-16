<template>
  <el-radio-group v-if="tagType==='radio'" :value="getValueSting" :disabled="disabled" @input="handleChange">
    <el-radio v-for="(item, key) in dictOptions" :key="key" :label="item.value">{{ item.label }}</el-radio>
  </el-radio-group>

  <el-radio-group v-else-if="tagType==='radioButton'" :value="getValueSting" :disabled="disabled" @input="handleChange">
    <el-radio-button v-for="(item, key) in dictOptions" :key="key" :label="item.value">{{ item.label }}</el-radio-button>
  </el-radio-group>

  <el-select v-else-if="tagType==='select'" :placeholder="placeholder" :disabled="disabled" :clearable="clearable"
             :value="getValueSting" @change="handleChange">
    <el-option v-for="(item, key) in dictOptions" :key="key" :value="item.value" :label="item.label" />
  </el-select>
</template>

<script>

export default {
  name: 'DictSelect',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    dictCode: {
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
    value: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'select'
    },

    dropdownUrl: {
      type: String,
      default: ''
    },
    dropdownParams: {
      type: Object,
      default: () => { return {} }
    }
  },
  data() {
    return {
      dictOptions: [],
      tagType: ''
    }
  },
  computed: {
    getValueSting() {
      return this.value || ''
    }
  },
  watch: {
    // 字典值改变，获取字典列表
    dictCode: {
      handler() {
        this.initDictData()
      },
      immediate: true
    },
    dropdownUrl: {
      handler() {
        this.initDictData()
      },
      immediate: true
    }

  },
  created() {
    if (!this.type || this.type === 'list') {
      this.tagType = 'select'
    } else {
      this.tagType = this.type
    }
  },
  methods: {
    initDictData() {
      this.dictOptions = []
      if (!this.dictCode && !this.dropdownUrl) {
        return
      }
      // 根据指定dropdown url 或 dict_code, 初始化字典数组
      this.$http({
        url: this.dropdownUrl || `/api/sys/v1/sys/sysDict/dropDown/${this.dictCode}`,
        method: 'get',
        params: this.dropdownParams
      }).then(res => {
        if (res.code === 1 && res.data) {
          if (res.data) {
            this.dictOptions = Object.keys(res.data).map(key => {
              return {
                label: res.data[key],
                value: key
              }
            })
          }
        }
      })
    },
    handleChange(val) {
      this.$emit('change', val)
      this.$emit('input', val) // el-radio
    },
    setCurrentDictOptions(dictOptions) {
      this.dictOptions = dictOptions
    },
    getCurrentDictOptions() {
      return this.dictOptions
    }
  }
}
</script>

<style scoped>
</style>
