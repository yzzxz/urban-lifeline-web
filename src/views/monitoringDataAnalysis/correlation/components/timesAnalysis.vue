<template>
  <div class="app-container">
    <!--  -->
    <el-form ref="queryForm" :model="query" :rules="rules" inline label-position="right" class="query-form">

      <el-form-item label="因变量" label-width="5rem" />

      <el-form-item label="监测内容" label-width="6rem">
        <el-select v-model="query.checkType" @change="getDevSnList">
          <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="测点编号" style="margin-left:2rem" prop="devSn">
        <el-select v-model="query.devSn">
          <el-option v-for="item in devSnList" :key="item.id" :label="item.deviceName" :value="item.deviceCode" />
        </el-select>
      </el-form-item>
      <br>
      <el-form-item label="时段1" label-width="5rem" />

      <el-form-item label="日期范围" prop="collectionTime1" label-width="6rem">
        <el-date-picker v-model="query.collectionTime1" type="datetimerange" start-placeholder="开始日期" end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss" range-separator=" - " :picker-options="pickerOptions" />
      </el-form-item>

      <br>

      <el-form-item label="时段2" label-width="5rem" />
      <el-form-item label="日期范围" prop="collectionTime2" label-width="6rem">
        <el-date-picker v-model="query.collectionTime2" type="datetimerange" start-placeholder="开始日期" end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss" range-separator=" - " :picker-options="pickerOptions" />
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
        <el-col :span="12" style="text-align: right">

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
        collectionTime1: [],
        collectionTime2: [],
        devSn: '',
        type: 'HOUR',
        collectionTimeStart1: '',
        collectionTimeEnd1: '',
        collectionTimeStart2: '',
        collectionTimeEnd2: ''
      },
      rules: {
        devSn: [{ required: true, message: '请选择测点编号', trigger: 'blur' }],
        collectionTime1: [{ required: true, message: '请选择日期范围', trigger: 'blur' }],
        collectionTime2: [{ required: true, message: '请选择日期范围', trigger: 'blur' }],
        type: [{ required: true, message: '请选择时间粒度', trigger: 'blur' }]
      },
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now()
        }
      },
      chart: null,

      chartData: {}

    }
  },
  computed: {
    result() {
      return this.chartData?.relatedMap ? this.chartData.relatedMap['相关性'] : ''
    }
  },
  watch: {
    'query.collectionTime1': {
      handler: function(val) {
        if (val && val.length === 2) {
          this.query.collectionTimeStart1 = val[0]
          this.query.collectionTimeEnd1 = val[1]
        } else {
          this.query.collectionTimeStart1 = ''
          this.query.collectionTimeEnd1 = ''
        }
      },
      // immediate: true,
      deep: true
    },
    'query.collectionTime2': {
      handler: function(val) {
        if (val && val.length === 2) {
          this.query.collectionTimeStart2 = val[0]
          this.query.collectionTimeEnd2 = val[1]
        } else {
          this.query.collectionTimeStart2 = ''
          this.query.collectionTimeEnd2 = ''
        }
      },
      // immediate: true,
      deep: true
    }
  },
  created() {
    this.getDevSnList()
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

    handleQuery() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          const num1 = this.$dayjs(this.query.collectionTimeEnd1)
            .diff(this.$dayjs(this.query.collectionTimeStart1), this.getTimeUnit())
          const num2 = this.$dayjs(this.query.collectionTimeEnd2)
            .diff(this.$dayjs(this.query.collectionTimeStart2), this.getTimeUnit())
          if (num1 === num2) {
            this.getChartData()
          } else {
            this.$message.warning('时段1与时段2的时间范围须保持一致！')
          }
        } else {
          return this.$message({
            type: 'warning',
            message: '请先输入必要的查询条件!'
          })
        }
      })
    },
    getTimeUnit() {
      switch (this.query.type) {
        case 'MIN':
          return 'minutes'
        case 'HOUR':
          return 'hours'
        case 'DAY':
          return 'days'
        default:
          return 'days'
      }
    },

    handleClearQuery() {
      this.query = {
        collectionTime1: [],
        collectionTime2: [],
        devSn: '',
        type: '',
        collectionTimeStart1: '',
        collectionTimeEnd1: '',
        collectionTimeStart2: '',
        collectionTimeEnd2: ''
      }
    },

    // 获取设备列表
    getDevSnList(init) {
      this.$http({
        url: '/api/scl/v1/scl/sclDevice/dl',
        method: 'get',
        params: {
          pageSize: -1,
          pageNum: -1,
          checkType: this.query.checkType
        }
      }).then((res) => {
        if (res?.code === 1) {
          this.devSnList = res.data.dataList
          if (init === 1) {
            this.query.devSn = this.devSnList[0]?.deviceCode || ''
            this.$nextTick(() => {
              this.handleQuery()
            })
          }
        }
      })
    },

    getChartData() {
      const {
        devSn,
        type,
        collectionTimeStart1,
        collectionTimeEnd1,
        collectionTimeStart2,
        collectionTimeEnd2
      } = this.query
      this.$http({
        url: '/api/scl/v1/scl/sclDeviceData/relatedBtTime',
        method: 'get',
        params: {
          devSn,
          type,
          collectionTimeStart1,
          collectionTimeEnd1,
          collectionTimeStart2,
          collectionTimeEnd2
        }
      }).then(res => {
        if (res.code === 1 && res.data) {
          this.chartData = JSON.parse(JSON.stringify(res.data))

          this.initChart(this.chartData)
        }
      })
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
            type: 'scatter'
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
.chart-container {
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
