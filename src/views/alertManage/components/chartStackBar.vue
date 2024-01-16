<template>
  <div class="chart-box">
    <!--    -->
    <div class="flex header">
      <span class="title">各类预警等级数量</span>
      <el-date-picker v-model="queryDate" type="date" placeholder="选择日期" @change="getChartData" />
    </div>
    <div ref="chart" class="chart" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

/**
 * 堆叠柱状图
 */
export default {
  name: 'ChartStackBar',
  props: {},
  data() {
    return {
      queryDate: new Date(),
      chart: null,
      // 默认配置项
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },

        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',

          splitLine: {
            lineStyle: {
              color: '#E0E6F1'
            }
          }
        },

        series: [],
        dataset: {
          dimensions: [],
          source: []
        }
      }
    }
  },

  mounted() {
    this.getChartData()

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
        url: '/api/scl/v1/scl/sclDeviceWarn/warnTypeCount',
        method: 'get',
        params: {
          startDate: this.$dayjs(this.queryDate).format('YYYY-MM-DD'),
          endDate: this.$dayjs(this.queryDate)
            .add(1, 'day')
            .format('YYYY-MM-DD')
        }
      }).then((res) => {
        if (res?.code === 1 && res.data) {
          console.log('预警占比数据', res.data)
          this.initChart(res.data)
        }
      })
    },
    initChart(data) {
      this.chart?.clear()
      this.chart?.dispose()
      this.chart = null

      this.chart = echarts.init(this.$refs.chart)
      const option = JSON.parse(JSON.stringify(this.option))
      option.dataset = {
        dimensions: ['时间', '一级预警', '二级预警', '三级预警'],
        source: Object.keys(data).map((k) => {
          return [k.padStart(2, '0') + ':00', ...data[k]]
        })
      }
      const color = ['#EB595C', '#F08D50', '#F0D550']
      for (let i = 1; i < option.dataset.dimensions.length; i++) {
        option.series.push({
          name: option.dataset.dimensions[i],
          type: 'bar',
          barWidth: 20,
          stack: 'total',
          color: color[i - 1]
        })
      }

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
