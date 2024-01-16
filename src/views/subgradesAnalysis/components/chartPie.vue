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
    formatter: {
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
        title: {
          text: '',
          show: true,
          left: 'center',
          top: 'middle',
          textStyle: {
            fontSize: 20,
            color: '#4279E4'
          }
        },
        color: ['#4279E4', '#D9E1FF'],
        series: [
          {
            name: '',
            type: 'pie',
            // selectedMode: 'single',

            formatter: '',
            clockWise: false,
            radius: ['65%', '75%'],
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
      option.title.text = (this.data[0] > 0 && this.data[1] > 0) ? Number(this.data[0] / this.data[1] * 100).toFixed(0) + ' %' : '0'
      option.title.textStyle.color = this.color
      option.color[0] = this.color
      option.series[0].name = this.name
      option.series[0].data = [
        {
          name: '风险数量',
          value: this.data[0],
          itemStyle: {
            borderColor: this.color,
            borderWidth: 6
          }
        },
        {
          name: '总计',
          value: this.data[1],
          itemStyle: {
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
