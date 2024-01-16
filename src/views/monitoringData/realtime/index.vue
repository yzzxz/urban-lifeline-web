<template>
  <div class="app-container">
    <!--  -->
    <el-form :model="query" inline label-width="7rem" class="query-form">
      <el-form-item label="监测内容">
        <el-select v-model="query.checkType" placeholder="" @change="getDevSnList">
          <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

      </el-form-item>

      <el-form-item label="路段选择">
        <dict-select ref="position-list" v-model="query.projectId" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                     :dropdown-params="{checkType:'SBJC'}" @change="getDevSnList()" />
      </el-form-item>

      <el-form-item label="测点编号">
        <el-select v-model="query.devSn" placeholder="">
          <el-option v-for="item in devSnList" :key="item.id" :label="item.deviceName" :value="item.deviceCode" />
        </el-select>
      </el-form-item>

      <el-form-item label=" ">
        <div style="display:flex">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
        </div>
      </el-form-item>
    </el-form>

    <div class="chart-container">
      <!--  -->
      <div class="header">
        <span class="title">{{ formatCheckType(query.checkType) }}</span>

        <div class="chart-buttons">
          <el-button v-show="warningInfo.warn3" :type="warningLevel.indexOf(3)!==-1?'info':'success'" @click="handleWarning(3)">超限三级
          </el-button>
          <el-button v-show="warningInfo.warn2" :type="warningLevel.indexOf(2)!==-1?'info':'warning'" @click="handleWarning(2)">超限二级
          </el-button>
          <el-button v-show="warningInfo.warn1" :type="warningLevel.indexOf(1)!==-1?'info':'danger'" @click="handleWarning(1)">超限一级
          </el-button>
        </div>
      </div>
      <el-empty v-if="tableData.length===0" :image-size="80" />
      <div ref="chart" class="chart-box" />
    </div>

    <div class="map-container">

      <!--  -->
      <div class="header">
        <span class="title">
          监测位置
        </span>
      </div>
      <div id="mapContainer" class="map-box">
        <div v-show="false" id="markerBox">
          <div key="markerBox11">
            <div class="map-marker"
                 style="position: absolute; top: 0px; left: 0px; transform-origin: 28px 70px; z-index: 12;
              display: block; pointer-events: auto; transform: translate(-28px, -70px) scale(1) rotate(0deg);">
              <div class="amap-icon" style="overflow: hidden; width: 50px;height: 50px;">
                <img style="width: 50px;height: 50px;"
                     :src="require(`@/assets/images/location.png`)">
              </div>
            </div>
          </div>
        </div>

        <!-- <el-amap ref="map" :zoom="zoom" :center="center">
       点标记
          <el-amap-marker v-if="devicePosition.length" :icon="require(`@/assets/images/location.png`)" :offset="[-16,-32]"
                          anchor="bottom-center" :position="devicePosition" />
        </el-amap> -->
      </div>

    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import mapmost from '@mapmost/mapmost-webgl'
// 实时监测数据查询
export default {
  name: 'Realtime',

  data() {
    return {
      zoom: 10,
      center: [120.58, 31.30],

      query: {
        checkType: '',
        projectId: '',
        devSn: ''
      },
      tableData: [
        // {
        //   collectionTime: '2023-10-15 12:43:10',
        //   sensorValue: 0.3
        // },
        // {
        //   collectionTime: '2023-10-15 12:44:12',
        //   sensorValue: 0.5
        // }
      ],
      warningLevel: [], // 超限预警等级
      warningInfo: {}, // 预警信息

      devSnList: [], // 测点编号列表
      devicePosition: [],

      webSocket: null,
      reconnect: true, // 失败重连
      chart: null,
      /** 地图相关 */
      map: null,
      copyMarkerDom: null,
      markerDataList: [],
      domList: []
    }
  },
  computed: {
    positionList() {
      return this.$refs['position-list']?.getCurrentDictOptions() || []
    }
  },
  watch: {
    tableData: {
      handler: function(val) {
        if (val && val.length) {
          const data = val.map((i) => {
            return {
              name: this.$dayjs(i.collectionTime).format('YYYY-MM-DD HH:mm:ss'),
              value: Number(i.sensorValue).toFixed(3)
            }
          })
          // 最多保存 500 条数据
          if (data.length > 500) {
            data.splice(0, 1)
          }
          // 接收到数据就更新
          this.refreshChartData(data)
        }
      },
      immediate: true,
      deep: true
    },
    devicePosition: {
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.createMarker(newVal)
        }
      },
      immediate: false
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getPositionList')
    await this.$store.dispatch('dict/getMonitoringItemList')
  },
  created() {
    const map = new mapmost.Map({
      container: 'mapContainer', // your HTML element id
      style: this.$mapMostStyle, // styleJson, // // 详见 https://www.mapmost.com/mapmost_docs/webgl/latest/docs/map-style
      center: this.center, // [120.58, 31.3], // 起始坐标
      zoom: this.zoom, // 起始缩放等级
      userId: this.$mapMostUserId // 授权码,正式环境要更换成 对方的
    })
    this.map = map
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)

    setTimeout(() => {
      this.initData()
    }, 600)
  },
  beforeDestroy() {
    this.reconnect = false
    this.webSocket?.close()
    this.webSocket = null

    window.removeEventListener('resize', this.handleResize)
    this.chart?.dispose()
    this.chart = null
  },
  methods: {
    // 页面初始化
    initData() {
      this.query.checkType =
        this.$store.state.dict.monitoringItemList[0]?.value || ''
      this.query.projectId = this.positionList[0]?.value || ''
      this.getDevSnList(1)
    },
    handleQuery() {
      if (!this.query.devSn) {
        return this.$message.warning('请先选择设备序列号！')
      }

      // 获取选择设备的相关信息（位置、预警配置）
      this.handleSelectDevice()
      this.tableData = []
      // 初始化图表
      this.initChart([])
      // 先查10条数据
      this.$http({
        url: '/api/scl/v1/scl/sclDeviceData/',
        method: 'get',
        params: {
          pageNum: 1,
          pageSize: 10,
          ...this.query
        }
      }).then((res) => {
        this.tableData = res.data.dataList
      })

      // 创建websocket连接
      if (!this.webSocket) {
        this.initWebSocket()
      }
    },

    handleClearQuery() {
      this.query = {
        checkType: '',
        projectId: '',
        devSn: ''
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
        }

        if (init === 1) {
          this.query.devSn = this.devSnList[0]?.deviceCode || ''
          this.handleQuery()
        }
      })
    },

    // 选中设备，获取选择设备的相关信息（位置、预警配置）
    handleSelectDevice() {
      // 查询设备预警信息
      const device = this.devSnList.find(
        (i) => i.deviceCode === this.query.devSn
      )

      this.query.checkType = device.deviceType
      // TODO 设备点位展示
      this.devicePosition = device.deviceCoordinates?.split(',')
      this.center = this.devicePosition
      // 告警阈值查询
      this.$http
        .get(`/api/scl/v1/scl/sclDeviceParam/?deviceCode=${this.query.devSn}`)
        .then((res) => {
          if (res?.code === 1 && res.data.dataList[0]) {
            this.warningInfo = {
              paramType: res.data.dataList[0].paramType,
              warn1: res.data.dataList[0].warn1,
              warn2: res.data.dataList[0].warn2,
              warn3: res.data.dataList[0].warn3
            }
          }
        })
    },

    // 超限预警处理
    handleWarning(level) {
      const index = this.warningLevel.indexOf(level)
      if (index === -1) {
        this.warningLevel.push(level)
      } else {
        this.warningLevel.splice(index, 1)
      }

      let markLineData = []
      let markAreaData = []
      // 三级 黄色 #f0d550
      if (this.warningLevel.indexOf(3) !== -1) {
        const area1 = [
          {
            yAxis: +this.warningInfo.warn2,
            itemStyle: {
              color: 'rgba(240,213,80,0.25)'
            }
          },
          {
            yAxis: +this.warningInfo.warn3,
            itemStyle: {
              color: 'rgba(240,213,80,0.25)'
            }
          }
        ]

        const area2 = [
          {
            yAxis: -this.warningInfo.warn3,
            itemStyle: {
              color: 'rgba(240,213,80,0.25)'
            }
          },
          {
            yAxis: -this.warningInfo.warn2,
            itemStyle: {
              color: 'rgba(240,213,80,0.25)'
            }
          }
        ]

        const arr = [
          {
            yAxis: +this.warningInfo.warn3,
            lineStyle: {
              color: '#f0d550'
            }
          },
          {
            yAxis: -this.warningInfo.warn3,
            lineStyle: {
              color: '#f0d550'
            }
          }
        ]
        if (this.warningInfo.paramType === '0') {
          // 0正负值，1正值，2负值
          markLineData = markLineData.concat(arr)
          markAreaData = markAreaData.concat([area1, area2])
        } else if (this.warningInfo.paramType === '1') {
          markAreaData = markAreaData.push(area1)
          markLineData = markLineData.push(arr[0])
        } else if (this.warningInfo.paramType === '2') {
          markAreaData = markAreaData.push(area2)
          markLineData = markLineData.push(arr[1])
        }
      }
      // 二级 橙色 #F08D50
      if (this.warningLevel.indexOf(2) !== -1) {
        const area1 = [
          {
            yAxis: +this.warningInfo.warn2,
            itemStyle: {
              color: 'rgba(240,141,80,0.25)'
            }
          },
          {
            yAxis: +this.warningInfo.warn1,
            itemStyle: {
              color: 'rgba(240,141,80,0.25)'
            }
          }
        ]

        const area2 = [
          {
            yAxis: -this.warningInfo.warn1,
            itemStyle: {
              color: 'rgba(240,141,80,0.25)'
            }
          },
          {
            yAxis: -this.warningInfo.warn2,
            itemStyle: {
              color: 'rgba(240,141,80,0.25)'
            }
          }
        ]
        const arr = [
          {
            yAxis: +this.warningInfo.warn2,
            lineStyle: {
              color: '#F08D50'
            }
          },
          {
            yAxis: -this.warningInfo.warn2,
            lineStyle: {
              color: '#F08D50'
            }
          },
          {
            yAxis: +this.warningInfo.warn1,
            lineStyle: {
              color: '#F08D50'
            }
          },
          {
            yAxis: -this.warningInfo.warn1,
            lineStyle: {
              color: '#F08D50'
            }
          }
        ]
        if (this.warningInfo.paramType === '0') {
          // 0正负值，1正值，2负值
          markAreaData = markAreaData.concat([area1, area2])
          markLineData = markLineData.concat(arr)
        } else if (this.warningInfo.paramType === '1') {
          markAreaData = markAreaData.push(area1)
          markLineData = markLineData.concat([arr[0], arr[2]])
        } else if (this.warningInfo.paramType === '2') {
          markAreaData = markAreaData.push(area2)
          markLineData = markLineData.concat([arr[1], arr[3]])
        }
      }
      // 一级 红色 #EB595C
      if (this.warningLevel.indexOf(1) !== -1) {
        const area1 = [
          {
            yAxis: +this.warningInfo.warn1,
            itemStyle: {
              color: 'rgba(235,89,92,0.25)'
            }
          },
          {
            yAxis: 9999
          }
        ]

        const area2 = [
          {
            yAxis: -this.warningInfo.warn1,
            itemStyle: {
              color: 'rgba(235,89,92,0.25)'
            }
          },
          {
            yAxis: -9999
          }
        ]
        const arr = [
          {
            yAxis: +this.warningInfo.warn1,
            lineStyle: {
              color: '#EB595C',
              width: 2
            }
          },
          {
            yAxis: -this.warningInfo.warn1,
            lineStyle: {
              color: '#EB595C',
              width: 2
            }
          }
        ]
        if (this.warningInfo.paramType === '0') {
          markAreaData = markAreaData.concat([area1, area2])
          // 0正负值，1正值，2负值
          markLineData = markLineData.concat(arr)
        } else if (this.warningInfo.paramType === '1') {
          markAreaData = markAreaData.push(area1)
          markLineData = markLineData.push(arr[0])
        } else if (this.warningInfo.paramType === '2') {
          markAreaData = markAreaData.push(area2)
          markLineData = markLineData.push(arr[1])
        }
      }

      const option = this.chart.getOption()
      option.series[0].markLine.data = markLineData
      option.series[0].markArea.data = markAreaData
      this.chart.setOption(option, true)
    },

    // 接收数据，刷新图表
    refreshChartData(data) {
      if (!this.chart) {
        return
      }
      const option = this.chart.getOption()
      console.log(option, data)
      option.xAxis[0].data = data.map((i) => i.name)
      option.series[0].data = data.map((i) => i.value)
      this.chart.setOption(option, true)
    },

    // 图表初始化
    initChart(data) {
      this.chart?.clear()
      this.chart?.dispose()
      this.chart = echarts.init(this.$refs.chart)

      const option = {
        grid: {
          top: 20,
          bottom: 30,
          left: 35,
          right: 35,
          containLabel: true
        },
        legend: {
          bottom: 0
        },
        tooltip: {
          trigger: 'axis'
        },

        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
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
          }
        },
        yAxis: {
          name: '位移(mm)',
          type: 'value',
          nameGap: 30,
          nameLocation: 'middle',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        color: '#2E95EC',
        series: [
          {
            name: '', // 测点编号
            type: 'line',
            symbol: 'none',
            data: [],
            markLine: {
              symbol: 'none',
              label: {
                show: false
              },
              silent: true,
              data: []
            },
            markArea: {
              data: []
            }
          }
        ]
      }
      option.series[0].name = this.formatCheckType(this.query.checkType)
      option.xAxis.data = data.map((i) => i.name)
      option.series[0].data = data
      option && this.chart.setOption(option)
    },
    createMarker(markerPosition) {
      const that = this
      this.$nextTick(function() {
        const domTemp = document.getElementById('markerBox').childNodes
        const markerBoxHtml = domTemp[0].outerHTML // 获取html
        const newMarkerDiv = document.createElement('div')
        newMarkerDiv.setAttribute('class', 'markerBox-marker')
        newMarkerDiv.innerHTML = markerBoxHtml
        new mapmost.Marker({
          offset: [0, 25], // [正右，正下]
          element: newMarkerDiv
        }).setLngLat(markerPosition)
          .addTo(that.map)
        // 创建 marker
      })
    },
    handleResize() {
      this.chart?.resize()
    },
    formatCheckType(val) {
      return this.$store.state.dict.monitoringItemList.find(
        (i) => i.value === val
      )?.label
    },

    initWebSocket() {
      // 初始化websocket
      const wsUrl = `ws://${
        process.env.NODE_ENV === 'development'
          ? `${location.host}/websocket`
          : 'seuicc.com:8305/websocket'
      }/${this.query.devSn}`

      this.webSocket = new WebSocket(wsUrl)
      this.webSocket.onmessage = this.webSocketOnMessage
      this.webSocket.onopen = this.webSocketOnOpen
      this.webSocket.onerror = this.webSocketOnError
      this.webSocket.onclose = this.webSocketClose
    },
    webSocketOnOpen() {
      console.log('建立连接')
      // 连接建立之后执行send方法发送数据
      // const actions = { test: '12345' }
      // this.webSocketSend(JSON.stringify(actions))
    },
    webSocketOnError() {
      if (this.reconnect) {
        console.log('失败重连')
        // 连接建立失败重连
        this.initWebSocket()
      }
    },
    webSocketOnMessage(e) {
      // 数据接收
      console.log('数据接收', e.data)
      const res = JSON.parse(e.data)
      this.tableData.push(res)
    },
    webSocketSend(data) {
      // 数据发送
      this.webSocket.send(data)
    },
    webSocketClose(e) {
      // 关闭
      console.log('断开连接', e)
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 16px 0 16px;
}
.query-form {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  height: 60px;

  .el-form-item {
    display: flex;
  }
}

.chart-container,
.map-container {
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

    .chart-buttons {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      .el-button--success {
        background-color: #f0d550;
        border-color: #f0d550;
      }
    }
  }
}

.chart-container {
  height: 50%;
  padding: 12px 16px 0 16px;

  .chart-box {
    height: calc(100% - 3rem);
  }
}

.map-container {
  height: calc(50% - 60px);
  padding: 0 16px;
  position: relative;
  .map-box {
    height: calc(100% - 3rem);
  }
  #mapContainer{
      position: absolute;
      top:0;
      bottom:0;
      width:100%;
      ::v-deep .mapmostgl-popup .mapmostgl-popup-content{
          padding:0px;
          width: fit-content;
        }
        //poup的close按钮
        ::v-deep .mapmostgl-popup .mapmostgl-popup-close-button{
          z-index:999;
          position: absolute;
          top: 0px;
        right: 10px;
        font-size: 20px;
        color: white;
    }

    }
}
</style>
