<template>
  <tree-select :dropdown-url="url" @change="handleChange" />
</template>

<script>
import TreeSelect from '@/components/TreeSelect/index.vue'
export default {
  name: 'OrgTreeSelect',
  components: { TreeSelect },
  model: {
    prop: 'value',
    event: 'change'
  },
  component: {
    TreeSelect
  },
  data() {
    return {
      url: '/api/sys/v1/sys/sysOrganization/tree'
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('change', val)
    }
  }
}
</script>

<style scoped>

</style>
