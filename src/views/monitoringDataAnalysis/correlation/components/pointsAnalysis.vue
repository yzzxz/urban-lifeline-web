<template>
  <div class="app-container">
    <!--  -->
    <el-form ref="queryForm" :model="query" inline :rules="rules" label-position="right" class="query-form">

      <el-form-item label="因变量1" label-width="5rem" />

      <el-form-item label="监测内容" prop="checkType1" label-width="6rem">
        <dict-select v-model="query.checkType1" dict-code="SCL_MONITORING_ITEM" />
      </el-form-item>
      <el-form-item label="测点编号" prop="devSn1" style="margin-left:2rem">
        <el-select v-model="query.devSn1" placeholder="">
          <el-option v-for="item in devSnList1" :key="item.id" :label="item.deviceName" :value="item.deviceCode" />
        </el-select>
      </el-form-item>
      <br>
      <el-form-item label="因变量2" label-width="5rem" />

      <el-form-item label="监测内容" prop="checkType2" label-width="6rem">
        <dict-select v-model="query.checkType2" dict-code="SCL_MONITORING_ITEM" />
      </el-form-item>
      <el-form-item label="测点编号" prop="devSn2" style="margin-left:2rem">
        <el-select v-model="query.devSn2" placeholder="">
          <el-option v-for="item in devSnList2" :key="item.id" :label="item.deviceName" :value="item.deviceCode" />
        </el-select>
      </el-form-item>
      <br>
      <el-form-item label="自变量" label-width="5rem" />
      <el-form-item label="日期范围" prop="collectionTime" label-width="6rem">
        <el-date-picker v-model="query.collectionTime" type="datetimerange" range-separator=" - " start-placeholder="开始日期" end-placeholder="结束日期"
                        :picker-options="pickerOptions" />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label=" " label-width="5rem" />

          <el-form-item label="时间粒度" prop="type" label-width="6rem">
            <el-radio-group v-model="query.type">
              <el-radio v-for="item in $store.state.dict.timeTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="text-align:right">
          <el-form-item label=" ">
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
            <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

    <div class="chart-container">
      <div class="header">
        <span class="title">
          散点图
        </span>

        <div class="chart-buttons">
          <el-button type="success" @click="changeMarkLine">线性拟合</el-button>
        </div>
      </div>
      <div ref="chart" class="chart-box" />
    </div>

    <div class="result-container">
      <span class="title">相关性系数：</span>

      <span>{{ result || '--' }}</span>
    </div>
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import * as echarts from 'echarts'
export default {
  mixins: [BaseCurd],
  data() {
    return {
      curdMountedMixin: false,
      devSnList: [],
      query: {
        checkType1: '',
        checkType2: '',
        devSn1: '',
        devSn2: '',
        collectionTime: [],
        collectionTimeStart: '',
        collectionTimeEnd: '',
        type: 'HOUR'
      },
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now()
        }
      },
      rules: {
        devSn1: [{ required: true, message: '请选择测点编号', trigger: 'blur' }],
        devSn2: [{ required: true, message: '请选择测点编号', trigger: 'blur' }],
        collectionTime: [{ required: true, message: '请选择日期范围', trigger: 'blur' }],
        type: [{ required: true, message: '请选择时间粒度', trigger: 'blur' }]
      },

      chart: null,
      chartData: {}
    }
  },
  computed: {
    devSnList1() {
      return this.query.checkType1 ? this.devSnList.filter(i => i.checkType === this.query.checkType1) : this.devSnList
    },
    devSnList2() {
      return this.query.checkType2 ? this.devSnList.filter(i => i.checkType === this.query.checkType2) : this.devSnList
    },
    result() {
      return this.chartData?.relatedMap ? this.chartData.relatedMap['相关性'] : ''
    }
  },
  watch: {
    'query.collectionTime': {
      handler: function(val) {
        if (val && val.length === 2) {
          this.query.collectionTimeStart = val[0]
          this.query.collectionTimeEnd = val[1]
        } else {
          this.query.collectionTimeStart = ''
          this.query.collectionTimeEnd = ''
        }
      },
      // immediate: true,
      deep: true
    }
  },
  activated() {},
  created() {
    this.getDevSnList()
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)

    this.$nextTick(() => {
      this.initData()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.chart?.dispose()
    this.chart = null
  },
  methods: {

    initData() {
      // 默认查询近3天
      this.$set(
        this.query,
        'collectionTime',
        [this.$dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
          this.$dayjs().format('YYYY-MM-DD HH:mm:ss')]
      )
    },

    handleQuery() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.getChartData()
        } else {
          return this.$message({
            type: 'warning',
            message: '请先输入必要的查询条件!'
          })
        }
      })
    },
    handleClearQuery() {
      this.query = {
        checkType1: '',
        checkType2: '',
        devSn1: '',
        devSn2: '',
        collectionTime: [],
        collectionTimeStart: '',
        collectionTimeEnd: '',
        type: ''
      }
    },

    // 获取测点编号列表
    getDevSnList(init) {
      this.$http({
        url: '/api/scl/v1/scl/sclDevice/dl',
        method: 'get',
        params: {
          pageSize: -1,
          pageNum: -1
        }
      }).then((res) => {
        if (res?.code === 1) {
          this.devSnList = res.data.dataList
        }
      })
    },

    getChartData() {
      const {
        type, collectionTimeStart, collectionTimeEnd
      } = this.query
      this.$http({
        url: '/api/scl/v1/scl/sclDeviceData/relatedBySn',
        method: 'get',
        params: {
          devSn: `${this.query.devSn1},${this.query.devSn2}`,
          type,
          collectionTimeStart,
          collectionTimeEnd
        }
      }).then(res => {
        if (res.code === 1 && res.data) {
          this.chartData = JSON.parse(JSON.stringify(res.data))

          this.initChart(this.chartData)
        }
      })
    },

    // 线性拟合
    changeMarkLine() {
      const a = Number(this.chartData.relatedMap['斜率']).toFixed(3)
      const b = Number(this.chartData.relatedMap['截距']).toFixed(3)

      // 为防止markLine不显示， 获取X轴的最大最小值计算
      const x1 = this.chart.getModel().getComponent('xAxis').axis.scale._extent[0]
      const x2 = this.chart.getModel().getComponent('xAxis').axis.scale._extent[1]

      const y1 = Number(x1 * a + Number(b)).toFixed(3)
      const y2 = Number(x2 * a + Number(b)).toFixed(3)

      const markLineData = {
        label: {
          formatter: `y = ${a} * x + ${b}`,
          align: 'right'
        },
        lineStyle: {
          type: 'solid'
        },
        tooltip: {
          formatter: `y = ${a} * x + ${b}`
        },
        data: [
          [
            {
              coord: [x1, y1],
              symbol: 'none'
            },
            {
              coord: [x2, y2],
              symbol: 'none'
            }
          ]
        ]
      }
      const option = this.chart.getOption()
      option.series[0].markLine = markLineData

      this.chart.setOption(option, true)
    },
    // 图表初始化
    initChart(data) {
      this.chart?.clear()
      this.chart?.dispose()
      this.chart = echarts.init(this.$refs.chart)

      const option = {
        xAxis: {
          axisLabel: {
            color: '#333'
          },
          axisTick: {
            show: false
          },

          axisLine: {
            lineStyle: {
              color: '#F5F6F9'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dotted'
            }
          }
        },
        yAxis: {
          axisLabel: {
            color: '#333'
          },
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#F5F6F9'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dotted'
            }
          }
        },
        grid: {
          top: 15,
          bottom: 15,
          left: 5,
          right: 15,
          containLabel: true
        },
        color: '#84A8ED',
        series: [
          {
            name: this.$store.state.dict.monitoringItemList.find(
              (i) => i.value === this.query.checkType
            )?.label,
            symbolSize: 10,
            data: data.resultList,
            type: 'scatter',
            markLine: {}
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
.query-form {
  border-bottom: 1px solid #ebeef5;
}
.chart-container{
  .header {
    width: 100%;
    height: 4rem;
    line-height: 4rem;
    position: relative;
    span.title {
      font-size: 16px;
      color: #1d2129;
      font-weight: 600;
    }

    .chart-buttons {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .chart-box {
    height: 25rem;
  }
}

.result-container {
  margin-top: 1rem;
  font-size: 16px;
  color: #1d2129;
  font-weight: 600;

  .title{
   margin-right: 0.5rem;
  }
}
</style>
