<template>
  <div class="app-container">
    <!--  -->
    <el-form ref="queryForm" class="query-form" :model="query" label-width="7rem" :rules="rules">

      <el-row :gutter="15">

        <el-col :span="8">
          <el-form-item label="监测内容" prop="checkType">
            <el-select v-model="query.checkType" @change="getDevSnList">
              <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="测点编号" prop="devSn">
            <el-select v-model="query.devSn">
              <el-option v-for="item in devSnList" :key="item.id" :label="item.deviceName" :value="item.deviceCode" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="日期范围" prop="collectionTime">
            <el-date-picker v-model="query.collectionTime" type="datetimerange" start-placeholder="开始日期" end-placeholder="结束日期"
                            value-format="yyyy-MM-dd HH:mm:ss" range-separator=" - " :picker-options="pickerOptions" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="时间粒度" prop="type">
            <el-radio-group v-model="query.type">
              <el-radio v-for="item in $store.state.dict.timeTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12" style="text-align:right">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
        </el-col>

      </el-row>

    </el-form>

    <div class="chart-container">
      <div class="header flex">
        <span class="title">趋势分析</span>

        <!--        <el-button type="primary" plain @click="handleExport">-->
        <!--          <svg-icon icon-class="monitoring-data" /> 数据导出-->
        <!--        </el-button>-->
      </div>

      <div ref="chart" class="chart-box" />
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import BaseCurd from '@/mixin/BaseCurd'
// import { getToken } from '@/utils/auth'
/**
 * 趋势分析
 */
export default {
  name: 'Trend',
  mixins: [BaseCurd],
  data() {
    return {
      curdMountedMixin: false,
      query: {
        collectionTime: [],
        checkType: '',
        type: 'HOUR',
        devSn: '',
        collectionTimeStart: '',
        collectionTimeEnd: ''
      },
      devSnList: [],
      chart: null,

      rules: {
        devSn: [{ required: true, message: '请选择测点编号', trigger: 'blur' }],
        collectionTime: [{ required: true, message: '请选择日期范围', trigger: 'blur' }],
        type: [{ required: true, message: '请选择时间粒度', trigger: 'blur' }]
      },

      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now()
        }
      }
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
  created() {
    // this.getDevSnList()
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getPositionList')
    await this.$store.dispatch('dict/getMonitoringItemList')
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
  },
  methods: {
    // 数据导出
    handleExport() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          // TODO 趋势数据导出接口
          // const {
          //   devSn,
          //   collectionTimeStart,
          //   collectionTimeEnd
          // } = this.query
          // this.$http({
          //   url: '/api/scl/v1/scl/sclDeviceData/exportHistory',
          //   method: 'get',
          //   params: {
          //     devSn,
          //     collectionTimeStart,
          //     collectionTimeEnd
          //   }
          // }).then((res) => {
          //   if (res?.code === 1 && res?.data) {
          //     const downloadUrl = res.data
          //     window.open(downloadUrl + '?token=' + getToken(), '_blank')
          //   }
          // })
        } else {
          return this.$message({
            type: 'warning',
            message: '请先输入必要的查询条件!'
          })
        }
      })
    },
    // 页面初始化
    initData() {
      // 默认查询近3天
      this.$set(
        this.query,
        'collectionTime',
        [this.$dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
          this.$dayjs().format('YYYY-MM-DD HH:mm:ss')]
      )

      this.query.checkType =
        this.$store.state.dict.monitoringItemList[0].value || ''

      this.getDevSnList(1)
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
        collectionTime: [],
        checkType: '',
        type: '',
        devSn: ''
      }
    },
    getChartData() {
      const {
        type,
        devSn,
        collectionTimeStart,
        collectionTimeEnd
      } = this.query
      this.$http({
        url: '/api/scl/v1/scl/sclDeviceData/trendCount',
        method: 'get',
        params: {
          type,
          devSn,
          collectionTimeStart,
          collectionTimeEnd
        }
      }).then(res => {
        if (res.code === 1 && res.data) {
          const data = Object.keys(res.data).map(key => {
            return {
              name: key,
              value: res.data[key]
            }
          })
          this.initChart(data)
        }
      })
    },
    initChart(data) {
      this.chart?.clear()
      this.chart?.dispose()

      this.chart = echarts.init(this.$refs.chart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            lineStyle: {
              // 设置纵向指示线
              type: 'dashed',
              color: '#4279E4',
              width: 2
            }
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
          data: data.map(i => i.name),
          axisLabel: {
            color: '#333'
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',

          splitLine: {
            lineStyle: {
              color: '#E0E6F1',
              type: 'dashed'
            }
          }
        },
        color: '#4279E4',
        series: [
          {
            name: this.$store.state.dict.monitoringItemList.find(
              (i) => i.value === this.query.checkType
            )?.label,
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: data,
            emphasis: {
              symbol: 'emptyCircle'
            }
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
.app-container {
  padding: 12px 0;

  .query-form {
    padding: 0 16px;
    .el-select,
    .el-input,
    .el-date-editor {
      width: 100%;
    }
  }

  .chart-container {
    padding: 12px 16px;

    .header {
      span.title {
        font-size: 16px;
        color: #1d2129;
        font-weight: 600;
      }
    }

    .chart-box {
      margin-top: 1rem;
      width: 100%;
      height: 40rem;
    }
  }
}
</style>
