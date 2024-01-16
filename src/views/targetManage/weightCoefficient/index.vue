<template>
  <div class="app-container">
    <target-table ref="possibility-table" index-classification="可能性指标" />

    <target-table ref="consequence-table" index-classification="后果指标" style="margin-top: 2rem" />
  </div>
</template>
<script>

import TargetTable from './components/targetTable.vue'
export default {
  name: 'WeightCoefficient',
  components: {
    TargetTable
  },

  data() {
    return {

    }
  },
  activated() {},
  mounted() {},
  methods: {}
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 0;

  .query-form,
  .table-container {
    padding: 12px 16px;
  }
}
</style>
