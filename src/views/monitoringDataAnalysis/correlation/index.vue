<template>
  <div class="container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="多监测点相关性分析" name="points">
        <template slot="label">
          <svg-icon icon-class="monitoring-analysis-points" /> 多监测点相关性分析
        </template>
        <points-analysis />
      </el-tab-pane>

      <el-tab-pane label="多时段相关性分析" name="times">
        <template slot="label">
          <svg-icon icon-class="monitoring-analysis-times" /> 多时段相关性分析
        </template>

        <times-analysis />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import PointsAnalysis from './components/pointsAnalysis.vue'
import TimesAnalysis from './components/timesAnalysis.vue'
export default {
  components: {
    PointsAnalysis,
    TimesAnalysis
  },
  data() {
    return {
      activeTab: 'points'
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getPositionList')
    await this.$store.dispatch('dict/getMonitoringItemList')
  },
  mounted() {},
  methods: {}
}
</script>
<style scoped lang="scss">
.container{
  height: 100%;
  background-color: #fff;
  padding: 12px 16px;
}
</style>
