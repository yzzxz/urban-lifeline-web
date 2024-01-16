<template>
  <div ref="chart" class="chart" />
</template>
<script>
import * as echarts from 'echarts'
export default {
  props: {
    color: {
      type: String,
      default: '#4279E4'
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data: {
      handler: function() {
        this.$nextTick(() => {
          this.initChart()
        })
      },
      deep: true
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)

    this.chart?.dispose()
    this.chart = null
  },
  methods: {
    // 图表初始化
    initChart() {
      this.chart?.clear()
      this.chart?.dispose()
      this.chart = echarts.init(this.$refs.chart)

      const option = {
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
          },
          data: this.data?.map(i => i.name) || []
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#E0E6F1'
            }
          }
        },
        color: this.color,
        series: [
          {
            data: this.data?.map(i => i.value) || [],
            type: 'bar',
            barWidth: 30
          }
        ]
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
.chart {
  width: 100%;
  height: 100%;
}
</style>
