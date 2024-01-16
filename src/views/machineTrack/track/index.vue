<template>
  <div class="app-container">

    <div class="map-container">
      <div id="mapContainer">
        <!-- 普通marker点 -->
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
      </div>

      <!-- <el-amap ref="map" :zoom="zoom" :center="center" map-style="amap://styles/whitesmoke">
        区域
        <template v-for="(polygon,index) in polygonList">
          <el-amap-polygon :key="'polygon'+index" :path="polygon.path" :fill-color="polygon.fillColor" :stroke-color="polygon.strokeColor"
                           :fill-opacity="0.1" />
          <el-amap-marker :key="'label'+index" anchor="bottom-center" :position="polygon.path[0]" @click="moveMap">
            <el-tooltip effect="dark" :content="polygon.projectName" placement="top">
              <img :src="require(`@/assets/images/location.png`)" alt="">
            </el-tooltip>
          </el-amap-marker>
        </template>

       轨迹线
        <template v-if="showMapPloyLine">
          <el-amap-polyline v-for="(item,index) in polylineList" :key="index" :path="item.path" stroke-color="#38CED2" stroke-style="solid"
                            :stroke-weight="6" :show-dir="true" />
        </template>
      </el-amap> -->
    </div>
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form">
      <el-form-item label="项目名称">
        <el-input v-model="query.projectId" />
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input v-model="query.camName" />
      </el-form-item>

      <el-form-item label="设备类型">
        <!-- <el-input v-model="query.param" /> -->
        <el-select v-model="query.deviceType">
          <el-option label="枪机" :value="1" />
          <el-option label="球机" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label=" " label-width="2rem">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-container">

      <!-- 列表操作按钮 -->
      <div class="table-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          新增
        </el-button>
      </div>
      <!-- 列表 -->
      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
                :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">

        <el-table-column label="序号" width="60" align="center">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mechanicalType" label="机械类型" min-width="100" />
        <el-table-column prop="mechanicalName" label="机械名称" min-width="120" />
        <el-table-column prop="projectId" label="项目名称" min-width="160" :formatter="formatProjectName" show-overflow-tooltip />
        <!--        <el-table-column prop="projectId" label="项目编码" min-width="120" :formatter="formatProjectCode" />-->
        <el-table-column prop="plateNumber" label="车牌号" min-width="120">
          <template v-slot="scope">
            <el-input v-model="scope.row.plateNumber" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="carNumber" label="车辆编号" min-width="120">
          <template v-slot="scope">
            <el-input v-model="scope.row.carNumber" size="small" />
          </template>
        </el-table-column>
        <!--  绑定设备ID  -->
        <el-table-column prop="bondedDevice" label="绑定设备" min-width="120">
          <template v-slot="scope">
            <el-select v-model="scope.row.deviceId" size="small" @change="(val)=>handleBound(val,scope.row)">
              <el-option v-for="item in deviceList.filter(i=>i.deviceType === scope.row.monitorDeviceType)" :key="item.id" :value="item.id"
                         :label="item.deviceName" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column prop="state" label="在线状态" width="80" align="center">
          <template v-slot="scope">
            <el-tag v-if="!scope.row.deviceId || scope.row.deviceId === '-'">未绑定</el-tag>
            <el-tag v-else-if="scope.row.state === '1'" type="success">在线</el-tag>
            <el-tag v-else type="danger">离线</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startDate" label="开始时间" min-width="150">
          <template v-slot="scope">
            <!--            {{ scope.row.startDate | dateTimeFilter }}-->
            <el-date-picker v-model="scope.row.collectionTimeStart" size="small" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
                            style="width:100%;" :picker-options="pickerOptions" />
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束时间" min-width="150">
          <template v-slot="scope">
            <!--            {{ scope.row.endDate | dateTimeFilter }}-->
            <el-date-picker v-model="scope.row.collectionTimeEnd" size="small" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
                            style="width:100%;" :picker-options="pickerOptions" />
          </template>
        </el-table-column>
        <el-table-column label="轨迹" width="50" align="center">
          <template v-slot="scope">
            <el-checkbox v-model="scope.row.isTrack" @change="(val)=>handleTrack(val,scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="scope">

            <el-link type="primary" :underline="false" @click="handleEdit(scope.row)">
              编辑
            </el-link>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定要解除设备绑定吗?" @confirm="()=>handleUntie(scope.row.id)">
              <el-link slot="reference" type="primary" :underline="false">
                解绑
              </el-link>
            </el-popconfirm>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">
              <el-link slot="reference" type="primary" :underline="false">
                删除
              </el-link>
            </el-popconfirm>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty :image-size="80" />
        </template>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination small :current-page.sync="pageNum" :page-sizes="pageSizeList" :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleChangePageSize"
                       @current-change="handleChangePage" />
      </div>
    </div>
    <!-- 表单编辑弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" @closeDialog="handleCloseDialog"
                 @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
import mapmost from '@mapmost/mapmost-webgl'
export default {
  name: 'TrackManage',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclTrack/',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },

      zoom: 14.5,
      center: [120.711109, 31.337599],
      showMapPloyLine: false,
      // 轨迹线
      polylineList: [
        // {
        //   path: [
        //     [120.589827, 31.309728],
        //     [120.584706, 31.302538],
        //     [120.580709, 31.300055],
        //     [120.591945, 31.309521],
        //     [120.591768, 31.306513]
        //   ],
        //   color: '#38CED2'
        // }
      ],

      deviceList: [],

      polygonList: [],
      polygonColor: [
        '#4279E4',
        '#3EB973',
        '#F08D50',
        '#EB595C',
        '#EEB61C',
        '#67C23A',
        '#A550F0'
      ],
      /** 地图相关 */
      map: null,
      markerList: [],
      copyMarkerDom: null,
      markerDataList: [],
      domList: [],
      curLayerAndSourceIdList: []
    }
  },

  watch: {
    polygonList: {
      handler(newVal, oldVal) {
        const that = this
        if (newVal.length > 0) {
          that.createPolygon(newVal)
          that.createMarker(newVal)
        }
      },
      immediate: false
    },
    showMapPloyLine: {
      handler(newVal, oldVal) {
        if (newVal) {
          this.curLayerAndSourceIdList = []
          this.createPloyLine()
        } else {
          this.removePloyLine()
        }
      },
      immediate: false
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getProjectList')
  },
  async created() {
    const map = new mapmost.Map({
      container: 'mapContainer', // your HTML element id
      style: this.$mapMostStyle, // styleJson, // // 详见 https://www.mapmost.com/mapmost_docs/webgl/latest/docs/map-style
      center: this.center, // [120.58, 31.3], // 起始坐标
      zoom: this.zoom, // 起始缩放等级
      userId: this.$mapMostUserId // 授权码,正式环境要更换成 对方的
    })
    this.map = map
    await this.getDeviceList()
  },
  mounted() {
    this.getProjectAreaList()
  },

  methods: {
    createPloyLine() {
      const polylineList = this.polylineList
      polylineList.forEach((polyline, index) => {
        const that = this
        const map = that.map
        const coordinatesCloseArr = polyline.path
        let flag = true
        // 过滤掉格式不正确的数组，避免绘制错误图层
        coordinatesCloseArr.forEach(item => {
          if (item.length !== 2) { flag = false }
        })
        if (flag) {
          // var routeGeoJson = {
          //   'type': 'FeatureCollection',
          //   'features': [{
          //     'type': 'Feature',
          //     'geometry': {
          //       'type': 'LineString',
          //       'coordinates': coordinatesCloseArr
          //     }
          //   }]
          // }

          map.addSource(`polylineSource${index}`, {
            'type': 'geojson',
            'lineMetrics': true,
            'data':
            {
              'type': 'FeatureCollection',
              'features': [{
                'type': 'Feature',
                'geometry': {
                  'type': 'LineString',
                  'coordinates': coordinatesCloseArr
                }
              }]
            }
          })
          map.addLayer({
            'id': `polylineLayer${index}`, // 'park-boundary',
            'type': 'line', // geojson 数据源支持 circle/ line/ fill/ symbol/ fill-extrusion/ heatmap
            'source': `polylineSource${index}`, // 'national-park',
            'layout': { },
            'paint': {
            // 'fill-color': polyline.fillColor ? polyline.fillColor : '#ABC6EF', // '#ABC6EF', //
            // 'fill-outline-color': '#38CED2', // 边界颜色。
            // 'fill-opacity': 0.3,
              // 'stroke': '#38CED2', // 线的颜色
              // 'stroke-width': 6, // 线的宽度
              // 'stroke-opacity': 1 // 线的透明度
              'line-width': 1,
              'line-color': '#38CED2'
            }
            // 'filter': ['==', '$type', 'Polygon']
          })

          that.curLayerAndSourceIdList.push({ layerId: `polylineLayer${index}`, sourceId: `polylineSource${index}` })
        }
      })
    },
    removePloyLine() {
      const that = this
      this.curLayerAndSourceIdList.forEach((item) => {
        that.map.removeLayer(item.layerId)
        that.map.removeSource(item.sourceId)
      })
      this.curLayerAndSourceIdList = []
    },
    createPolygon(polygonList) {
      const that = this
      const map = that.map

      polygonList.forEach((polygon, index) => {
        const coordinatesCloseArr = JSON.parse(JSON.stringify(polygon.path))
        let flag = true
        // 过滤掉格式不正确的数组，避免绘制错误图层
        coordinatesCloseArr.forEach(item => {
          if (item.length !== 2) { flag = false }
        })
        if (flag) {
          map.addSource(`source${index}`, {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': [
                {
                  'type': 'Feature',
                  'geometry': {
                    'type': 'Polygon',
                    'coordinates': [coordinatesCloseArr]
                    // [
                    //   [
                    //     [120.720, 31.308],
                    //     [120.730, 31.308],
                    //     [120.730, 31.315],
                    //     [120.720, 31.315],
                    //     [120.720, 31.308]
                    //   ]
                    // ]
                  }
                }
              ]
            }
          })
          map.addLayer({
            'id': `layer${index}`, // 'park-boundary',
            'type': 'fill', // geojson 数据源支持circle/ line/ fill/ symbol/ fill-extrusion/ heatmap
            'source': `source${index}`, // 'national-park',
            'layout': { },
            'paint': {
              'fill-color': polygon.fillColor ? polygon.fillColor : '#ABC6EF', // '#ABC6EF', //
              'fill-outline-color': polygon.strokeColor ? polygon.strokeColor : '#3bb2d0', // '#3bb2d0', // 面元素的边界颜色。
              'fill-opacity': 0.3
            },
            'filter': ['==', '$type', 'Polygon']
          })
        }
      })
    },
    createMarker(markerArr) {
      const that = this
      this.markerList = []
      this.markerDataList = markerArr

      this.$nextTick(function() {
        const domTemp = document.getElementById('markerBox').childNodes
        markerArr.forEach((item) => {
          const markerBoxHtml = domTemp[0].outerHTML // 获取html
          const newMarkerDiv = document.createElement('div')
          newMarkerDiv.setAttribute('id', item.id)
          newMarkerDiv.setAttribute('class', 'markerBox-marker')
          newMarkerDiv.setAttribute('class', 'my-tooltip')
          newMarkerDiv.setAttribute('aria-label', item.projectName)
          // newMarkerDiv.setAttribute('title', item.projectName)
          newMarkerDiv.innerHTML = markerBoxHtml
          const m1 = new mapmost.Marker({
            offset: [0, 25], // [正右，正下]
            element: newMarkerDiv
          }).setLngLat(item.path[0])
            .addTo(that.map)
            // 创建 marker
          that.markerList.push(m1)
        })

        const markerDOmList = document.getElementsByClassName('markerBox-marker')
        markerDOmList.forEach((markerDOmItem, markerDOmItemIndex) => {
          markerDOmItem.addEventListener('click', () => {
            const pathTemp = this.polygonList[markerDOmItemIndex].path

            if (pathTemp && pathTemp[0] && pathTemp[0].length === 2) {
              const selectedMarkerLngLat = pathTemp[0]
              that.moveMap(selectedMarkerLngLat)
            }
          })
        })
      })
    },
    // 移动地图
    moveMap(LngLatArr) {
      this.center = LngLatArr // [lng  lat]
      this.map.setCenter(this.center).setZoom(16)
    },
    // 高德地图版
    // moveMap(e) {
    //   this.center = [e.lnglat.lng, e.lnglat.lat]
    //   // this.$nextTick(() => {
    //   //   this.zoom = 16
    //   // })
    //   this.$refs['map'].$$getInstance().setZoom(16)
    // },
    // 获取项目区域划分
    getProjectAreaList() {
      this.$http({
        url: '/api/scl/v1/scl/sclProject/',
        methods: 'get',
        params: {
          pageSize: -1,
          pageNum: -1
        }
      }).then((res) => {
        if (res?.code === 1 && res.data.dataList) {
          this.polygonList = []
          res.data.dataList.map((item, index) => {
            const areaArr = item.custom1.split('|')
            areaArr.map((area) => {
              const pointArr = area.split(';')
              this.polygonList.push({
                ...item,
                path: pointArr.map((i) => i.split(',')),
                fillColor: this.polygonColor[index] || '#4279E4',
                strokeColor: this.polygonColor[index] || '#4279E4'
              })
            })
          })
        }
      })
    },

    // 绘制轨迹
    handleTrack(isTrack, row) {
      // if (!isTrack) {
      //   return
      // }
      if (!row.collectionTimeStart || !row.collectionTimeEnd) {
        row.isTrack = false
        return this.$message.warning('请先选择开始时间和结束时间')
      }
      if (this.$dayjs(row.collectionTimeStart).isAfter(row.collectionTimeEnd)) {
        row.isTrack = false
        return this.$message.warning('结束时间不能早于开始时间')
      }
      // 获取轨迹坐标点
      if (row.isTrack) {
        const loading = this.$loading({
          lock: true,
          text: '正在加载轨迹点，请稍候...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.showMapPloyLine = false
        this.$http({
          url: '/api/scl/v1/scl/sclDeviceData/',
          method: 'get',
          params: {
            pageSize: -1,
            pageNum: -1,
            devSn: row.deviceNumber,
            collectionTimeStart: row.collectionTimeStart,
            collectionTimeEnd: row.collectionTimeEnd
          }
        })
          .then((res) => {
            if (res?.code === 1) {
              // this.polylineList = []
              // console.log('轨迹坐标', res.data.dataList)

              const path = []
              res.data.dataList.map((i) => {
                path.push(i.sensorValue?.split(','))
              })
              // console.log('path :>> ', path)

              if (path.length) {
                this.center = path[0]
              }

              const temp = this.polylineList.find(
                (i) => i.devSn === row.deviceNumber
              )
              if (temp) {
                temp.path = []
                temp.path = path
              } else {
                this.polylineList.push({
                  devSn: row.deviceNumber,
                  path: path
                })
              }
              this.showMapPloyLine = true
              // console.log('this.polylineList :>> ', this.polylineList)
            }
          })
          .finally(() => {
            loading.close()
          })
      } else {
        const index = this.polylineList.find(
          (i) => i.devSn === row.deviceNumber
        )
        if (index !== -1) {
          this.polylineList.splice(index, 1)
        }
        this.showMapPloyLine = false
      }
    },
    // 绑定设备
    handleBound(id, row) {
      const dev = this.deviceList.find((i) => i.id === id)
      if (dev) {
        const para = {
          id: row.id,
          deviceId: id,
          deviceNumber: dev.deviceCode,
          carNumber: dev.carNumber,
          plateNumber: dev.plateNumber
        }
        this.editFormData(para)
      }
    },
    // 解绑设备
    handleUntie(id) {
      const para = {
        id: id,
        deviceId: '-',
        deviceNumber: '-'
      }
      this.editFormData(para)
    },

    // 获取监测设备列表
    getDeviceList() {
      this.$http({
        url: '/api/scl/v1/scl/sclDevice/',
        method: 'get',
        params: {
          pageSize: -1,
          pageNum: -1
        }
      }).then((res) => {
        this.deviceList = res.data?.dataList
      })
    },

    formatProjectName(row, col, cellVal) {
      return (
        this.$store.state.dict.projectList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatProjectCode(row, col, cellVal) {
      return (
        this.$store.state.dict.projectList.find((i) => i.value === cellVal)
          ?.code || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 0;

  .map-container {
    height: 40vh;
    padding: 8px;
    position: relative;
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
      .my-tooltip {
            // position: relative;
            // margin: 50px auto;
            border: 1px solid;
            padding:5px;
            background: #303133; color: #fff;
            width: 100%;
        }
    /**my-tooltip是自定义的class ，但可能因为被创建在marker中了，所以需要::v-deep才起作用 */
    ::v-deep  .my-tooltip:hover:after {
            content: attr(aria-label);
            position: absolute;
            bottom: 70px;
            left: -40px;
            border: none;
            width: max-content;
            // height:max-content;
            border-radius: 4px;
            padding: 10px;
            // z-index: 2000;
            font-size: 12px;
             line-height: 1.2;
            word-wrap: break-word;
            color: #fff;
            background: black;
       }

    }
  }
  .query-form,
  .table-container {
    padding: 12px 16px;
  }
}
</style>
