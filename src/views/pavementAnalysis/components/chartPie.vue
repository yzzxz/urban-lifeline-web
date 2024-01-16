<template>
  <div ref="chart" class="chart" />
</template>
<script>
import * as echarts from 'echarts'
export default {
  props: {
    color: {
      type: Array,
      default: () => { return ['#4279E4', '#7F95F1', '#7DD4BD', '#EA7E8F', '#EE946C'] }
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

      const total = this.data.reduce((prev, curr) => {
        return Number(prev || 0) + curr.value
      }, 0)

      const option = {
        tooltip: {
          trigger: 'item'
        },

        legend: {
          orient: 'vertical',
          right: 5,
          top: 'middle',
          // 格式化图例文本
          formatter: (name) => {
            // 找到data中name和文本name值相同的对象
            const val = this.data.find(item => {
              return item.name === name
            })
            return name + '  ' + ((val.value / total) * 100).toFixed(2) + '%'
          }
        },
        color: this.color,
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              // borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                formatter: '{bold|{d}%} \n {gray|{b}}',
                // fontWeight: 'bold'
                rich: {
                  bold: {
                    fontWeight: 'bold',
                    fontSize: 26
                  },
                  gray: {
                    lineHeight: 30,
                    color: '#909399'
                  }
                }
              }

            },
            labelLine: {
              show: false
            },
            data: this.data
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
