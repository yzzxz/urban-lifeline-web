<template>
  <div class="app-container">
    <!--  -->
    <el-form ref="queryForm" class="query-form" :model="query" label-width="7rem" :rules="rules">

      <el-row :gutter="15">

        <el-col :span="8">
          <el-form-item label="监测内容" prop="checkType">
            <el-select v-model="query.checkType" @change="getDevSnList()">
              <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="测点位置" prop="projectId">
            <dict-select v-model="query.projectId" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                         :dropdown-params="{checkType:'SBJC'}" @change="getDevSnList()" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="测点编号" prop="devSn">
            <el-select v-model="query.devSn" placeholder="">
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

        <el-col :span="8">
          <el-form-item label="时间粒度" prop="type">
            <el-radio-group v-model="query.type">
              <el-radio v-for="item in $store.state.dict.timeAllTypeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="8" style="text-align:right">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
        </el-col>

      </el-row>

    </el-form>

    <div class="chart-container">
      <div class="header flex">
        <span class="title">特征值分析</span>

        <el-button type="primary" plain @click="handleExport">
          <svg-icon icon-class="monitoring-data" /> 数据导出
        </el-button>
      </div>

      <div ref="chart" class="chart-box" />
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import BaseCurd from '@/mixin/BaseCurd'
import { getToken } from '@/utils/auth'
/**
 * 特征值分析
 */
export default {
  mixins: [BaseCurd],
  data() {
    return {
      curdMountedMixin: false,

      rules: {
        checkType: [
          { required: true, message: '请选择监测内容', trigger: 'blur' }
        ],
        projectId: [
          { required: true, message: '请选择测点位置', trigger: 'blur' }
        ],
        devSn: [{ required: true, message: '请选择测点编号', trigger: 'blur' }],
        collectionTime: [
          { required: true, message: '请选择日期范围', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择时间粒度', trigger: 'blur' }]
      },

      query: {
        checkType: '',
        projectId: '',
        devSn: '',
        type: 'HOUR',
        collectionTime: []
      },
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now()
        }
      },

      devSnList: [],

      chart: null

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
  async beforeCreate() {
    await this.$store.dispatch('dict/getPositionList')
    await this.$store.dispatch('dict/getMonitoringItemList')
  },

  mounted() {
    window.addEventListener('resize', this.handleResize)

    this.initData()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.chart?.dispose()
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
        checkType: '',
        projectId: '',
        devSn: '',
        type: '',
        collectionTime: []
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
          projectId: this.query.projectId,
          checkType: this.query.checkType
        }
      }).then((res) => {
        if (res?.code === 1) {
          this.devSnList = res.data.dataList
          if (init === 1) {
            this.query.devSn = this.devSnList[0]?.deviceCode || ''
            this.handleQuery()
          }
        }
      })
    },

    // 特征值查询
    getChartData() {
      const { checkType, projectId, devSn, type, collectionTimeStart, collectionTimeEnd } = this.query
      this.$http({
        url: '/api/scl/v1/scl/sclDeviceData/getCount',
        methods: 'get',
        params: {
          checkType,
          projectId,
          devSn,
          type,
          collectionTimeStart,
          collectionTimeEnd
        }
      }).then((res) => {
        if (res?.code === 1 && res?.data) {
          // console.log(res.data)
          this.initChart(res.data)
        }
      })
    },
    // 数据导出
    handleExport() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.exportExcel()
        } else {
          return this.$message({
            type: 'warning',
            message: '请先输入必要的查询条件!'
          })
        }
      })
    },
    exportExcel() {
      const {
        checkType,
        projectId,
        devSn,
        type,
        collectionTimeStart,
        collectionTimeEnd
      } = this.query
      this.$confirm('导出数据到Excel文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http({
            url: '/api/scl/v1/scl/sclDeviceData/export',
            method: 'get',
            params: {
              checkType,
              projectId,
              devSn,
              type,
              collectionTimeStart,
              collectionTimeEnd
            }
          }).then((res) => {
            if (res?.code === 1 && res?.data) {
              const downloadUrl = res.data
              window.open(downloadUrl + '?token=' + getToken(), '_blank')
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作已取消'
          })
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
          // top: 5,
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        legend: {
          show: true,
          bottom: 0
          // icon: 'emptyCircle'
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            // formatter: '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}',
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
        color: ['#4279E4', '#3EB973', '#F08D50', '#F56C6C', '#79BBFF'],
        series: []
      }
      // TODO '方差', '均方根'
      const seriesName = ['最高值', '最低值', '平均值', '均方根', '方差']

      // 时间点
      const arr = Object.keys(data).sort((a, b) => {
        return this.$dayjs(a) - this.$dayjs(b)
      })

      seriesName.map((name, index) => {
        option.series.push({
          name: name,
          type: 'line',
          smooth: true,
          symbol: 'none',
          emphasis: {
            symbol: 'emptyCircle'
          },
          data: arr.map((time) => data[time][index])
        })
      })
      option.xAxis.data = arr

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
