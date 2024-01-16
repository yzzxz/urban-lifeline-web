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
    name: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => {
        return [0, 0]
      }
    }
  },
  data() {
    return {
      chart: null,
      option: {
        color: ['#4279E4', '#D9E1FF'],
        series: [
          {
            name: '',
            type: 'pie',
            // selectedMode: 'single',
            clockWise: false,
            radius: ['60%', '75%'],
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            emphasis: {
              scale: false
            },
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })

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

      const option = this.option
      option.color[0] = this.color
      option.series[0].name = this.name
      option.series[0].data = [
        {
          name: '在线',
          value: this.data[0],
          itemStyle: {
            borderColor: this.color,
            borderWidth: 6

            // shadowColor: this.color,
            // shadowBlur: 10
          }
        },
        {
          name: '离线',
          value: this.data[1],
          itemStyle: {
            // borderColor: this.color,
            borderWidth: 3
          }
        }
      ]

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
