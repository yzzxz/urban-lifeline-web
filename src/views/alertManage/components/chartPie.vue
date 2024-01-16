<template>
  <div class="chart-box">
    <!--    -->
    <div class="header flex">
      <span class="title">预警类型占比情况</span>
      <el-date-picker v-model="queryDate" type="date" placeholder="选择日期" @change="getChartData" />
    </div>

    <el-empty v-if="chartData.length===0" :image-size="80" />
    <div ref="chart" class="chart" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

/**
 * 饼图
 */
export default {
  name: 'ChartPie',
  props: {},
  data() {
    return {
      queryDate: new Date(),
      chartData: [],
      chart: null,
      // 默认配置项
      option: {
        legend: {
          show: true,
          right: 10,
          top: 'center'
        },
        color: ['#249EFF', '#4279E4', '#8EABFF', '#81E2FF'],
        series: [
          {
            name: '预警类型占比',
            type: 'pie',
            // minAngle: 15, // 最小角度
            // startAngle: 270, // 起始角度
            radius: ['50%', '65%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            label: {
              formatter: '{b} {d}%'
              // color: 'inherit'
            },
            labelLine: {
              length: 20,
              length2: 70,
              lineStyle: {
                color: 'inherit'
              }
            },
            data: []
          }
        ]
      }
    }
  },
  computed: {
    monitoringItemList() {
      return this.$store.state.dict.monitoringItemList
    }
  },
  watch: {
    monitoringItemList: {
      handler: function(val) {
        if (val && val.length) {
          this.getChartData()
        }
      }
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getMonitoringItemList')
  },
  mounted() {
    // this.getChartData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.chart?.dispose()
    this.chart = null
  },
  methods: {
    getChartData() {
      this.$http({
        url: '/api/scl/v1/scl/sclDeviceWarn/warnNumCount',
        method: 'get',
        params: {
          startDate: this.$dayjs(this.queryDate).format('YYYY-MM-DD'),
          endDate: this.$dayjs(this.queryDate)
            .add(1, 'day')
            .format('YYYY-MM-DD')
        }
      }).then((res) => {
        if (res?.code === 1 && res.data) {
          this.initChart(res.data)
        }
      })
    },
    initChart(data) {
      this.chart?.clear()
      this.chart?.dispose()
      this.chart = null

      this.chartData = []
      Object.keys(data).map((key) => {
        this.chartData.push({
          name:
            this.monitoringItemList.find(
              (i) => i.value === key
            )?.label || key,
          value: data[key]
        })
      })
      if (this.chartData.length === 0) {
        return
      }

      this.chart = echarts.init(this.$refs.chart)
      const option = JSON.parse(JSON.stringify(this.option))

      option.series[0].data = this.chartData

      option && this.chart.setOption(option)
    },

    handleResize() {
      this.chart?.resize()
    }
  }
}
</script>

<style scoped lang="scss">
.chart-box {
  width: 100%;
  height: 100%;
  padding: 12px 16px;
  .header {
    width: 100%;
    height: 3rem;
    line-height: 3rem;
    position: relative;
    span.title {
      font-size: 16px;
      color: #1d2129;
      font-weight: 600;
    }
  }
  .chart {
    height: calc(100% - 3rem);
  }
}
</style>
