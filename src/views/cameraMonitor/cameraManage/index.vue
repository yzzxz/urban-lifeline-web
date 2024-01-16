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
        <!-- 摄像头marker点 -->
        <div v-show="false" id="cameraMarkerBox">
          <!-- 第一种 v-if="marker.camType === '1' -->
          <div key="cameraMarkerBox11">
            <div class="map-marker"
                 style="position: absolute; top: 0px; left: 0px; transform-origin: 28px 70px; z-index: 12;
              display: block; pointer-events: auto; transform: translate(-28px, -70px) scale(1) rotate(0deg);">
              <div class="amap-icon" style="overflow: hidden; width: 50px;height: 70px;">
                <img style="width: 50px;height: 70px;"
                     :src="require(`@/assets/images/camera-blue.png`)">
              </div>

            </div>
          </div>
          <!-- 第二种 marker.camType === '2' -->
          <div key="cameraMarkerBox22">
            <div class="map-marker"
                 style="position: absolute; top: 0px; left: 0px; transform-origin: 28px 70px; z-index: 12;
              display: block; pointer-events: auto; transform: translate(-28px, -70px) scale(1) rotate(0deg);">
              <div class="amap-icon" style="overflow: hidden; width: 50px;height: 70px;">
                <img style="width: 50px;height: 70px;"
                     :src="require(`@/assets/images/camera2-blue.png`)">
              </div>

            </div>

          </div>
        </div>
      </div>
      <!-- 原版 高德地图 -->
      <!-- <el-amap ref="map" :zoom="zoom" :center="center" map-style="amap://styles/whitesmoke">
        <template v-for="(polygon,index) in polygonList">
          <el-amap-polygon :key="'polygon'+index" :path="polygon.path" :fill-color="polygon.fillColor" :stroke-color="polygon.strokeColor"
                           :fill-opacity="0.1" />
          <el-amap-marker :key="'label'+index" anchor="bottom-center" :position="polygon.path[0]" @click="moveMap">
            <el-tooltip effect="dark" :content="polygon.projectName" placement="top">
              <img :src="require(`@/assets/images/location.png`)" alt="">
            </el-tooltip>
          </el-amap-marker>
        </template>

        <template v-for="marker in tableData">
          <el-amap-marker v-if="marker.longitude && marker.latitude"
           :key="marker.id" :icon="require(`@/assets/images/camera-blue.png`)"
                          anchor="bottom-center" :position="[marker.longitude, marker.latitude]">
            <el-tooltip effect="dark" :content="marker.camName" placement="top">
              <img v-if="marker.camType === '1'" :src="require(`@/assets/images/camera-blue.png`)" alt="">
              <img v-else-if="marker.camType === '2'" :src="require(`@/assets/images/camera2-blue.png`)" alt="">
            </el-tooltip>
          </el-amap-marker>
        </template>
      </el-amap> -->

    </div>
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form">
      <el-form-item label="项目名称">
        <el-select v-model="query.projectId" clearable>
          <el-option v-for="item in projectList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="设备名称">
        <el-input v-model="query.camName" clearable />
      </el-form-item>

      <el-form-item label="设备类型">
        <el-select v-model="query.camType" clearable>
          <el-option label="枪机" :value="1" />
          <el-option label="球机" :value="2" />
        </el-select>
      </el-form-item> -->

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
        <el-table-column type="selection" width="55" :reserve-selection="true" align="center" />
        <el-table-column label="序号" width="60" align="center">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="projectId" label="项目名称" min-width="160" :formatter="formatProjectName" show-overflow-tooltip />
        <el-table-column prop="camName" label="设备名称" min-width="120" />
        <el-table-column prop="camType" label="设备类型" min-width="80">
          <template v-slot="scope">
            <el-tag v-if="scope.row.camType==='1'" type="success">枪机</el-tag>
            <el-tag v-else-if="scope.row.camType==='2'" type="primary">球机</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="camSerialNo" label="序列号" min-width="100" />
        <el-table-column prop="address" label="设备位置" min-width="150" show-overflow-tooltip />
        <el-table-column prop="" label="设备坐标" min-width="120">
          <template v-slot="scope">
            {{ scope.row.longitude }},{{ scope.row.latitude }}
          </template>
        </el-table-column>
        <el-table-column prop="functionName" label="功能" min-width="150">
          <template v-slot="scope">
            <!--  -->
            <el-tag v-for="(item,index) in formatFunctionName(scope.row.functionName)" :key="index" size="small"
                    style="margin-right: 0.5rem;margin-bottom: 0.5rem">
              {{ item }}
            </el-tag>

          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleEdit(scope.row)">
              编辑
            </el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" :underline="false" @click="handleVideoPreview(scope.row)">
              视频画面
            </el-link>
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

    <video-dialog :video-data="videoData" :is-show="videoShow" @closeDialog="handleCloseVideoDialog" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
import VideoDialog from './dialog/videoDialog.vue'
import mapmost from '@mapmost/mapmost-webgl'
export default {
  name: 'CameraManage',
  components: {
    FormDialog,
    VideoDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/sec/v1/sec/secCamera/',
      deleteAllId: 'secCameraIds',

      zoom: 14.5,
      center: [120.711109, 31.337599],
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
      videoData: {},
      videoShow: false,
      /** 地图相关 */
      map: null,
      markerList: [],
      copyMarkerDom: null,
      markerDataList: [],
      domList: []

    }
  },
  computed: {
    funcList() {
      return this.$store.state.dict.funcList
    },
    projectList() {
      return this.$store.state.dict.projectList
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
    tableData: {
      handler(newVal, oldVal) {
        const that = this
        if (newVal.length > 0) {
          that.createCameraMarker(newVal)
        }
      },
      immediate: false
    }
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
    await this.$store.dispatch('dict/getFuncList')
    await this.$store.dispatch('dict/getProjectList')
  },
  mounted() {
    this.getProjectAreaList()
  },
  methods: {
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
          // newMarkerDiv.setAttribute('title', item.projectName)
          newMarkerDiv.setAttribute('id', item.id)
          newMarkerDiv.setAttribute('class', 'markerBox-marker')
          newMarkerDiv.setAttribute('class', 'my-tooltip')
          newMarkerDiv.setAttribute('aria-label', item.projectName)

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
    createCameraMarker(markerArr) {
      const that = this
      this.$nextTick(function() {
        const domTemp = document.getElementById('cameraMarkerBox').childNodes
        markerArr.forEach((item) => {
          const markerBoxHtml = item.camType === '1' ? domTemp[0].outerHTML : domTemp[1].outerHTML // 获取html
          const newMarkerDiv = document.createElement('div')
          // newMarkerDiv.setAttribute('title', item.camName)
          newMarkerDiv.setAttribute('class', 'my-tooltip')
          newMarkerDiv.setAttribute('aria-label', item.camName)
          newMarkerDiv.innerHTML = markerBoxHtml
          new mapmost.Marker({
            offset: [0, 35], // [正右，正下]
            element: newMarkerDiv
          }).setLngLat([item.longitude, item.latitude])
            .addTo(that.map)
        })
      })
    },

    // 移动地图
    moveMap(LngLatArr) {
      this.center = LngLatArr // [lng  lat]
      this.map.setCenter(this.center).setZoom(16)
    },

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
    // 视频画面预览
    handleVideoPreview(row) {
      if (!row.linkAddress) {
        return this.$message.warning('该摄像头暂未配置视频流地址，请先配置！')
      }
      this.videoData = {
        id: row.id,
        url: row.linkAddress, // 视频流地址
        format: 'flv' // 视频流格式，暂时全部是flv，后续可根据提供的地址作相应调整
      }
      this.videoShow = true
    },
    // 关闭视频预览弹窗
    handleCloseVideoDialog() {
      this.videoShow = false
      this.videoData = {}
    },

    formatFunctionName(funcCodeStr) {
      const arr = funcCodeStr?.split(';').filter((item) => !!item) || []
      if (arr && arr.length) {
        return arr.map(
          (code) => this.funcList.find((i) => i.value === code)?.label || ''
        )
      }
      return []
    },

    formatProjectName(row, col, cellVal) {
      return this.projectList.find((i) => i.value === cellVal)?.label || cellVal
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
    .marker {
      width: 34px;
      height: 34px;
      background-image: url(https://www.mapmost.com/mapmost_docs/webgl/latest/demoScript/img/Mapmost.png);
      background-size: 100%;

  }
}

  .query-form,
  .table-container {
    padding: 12px 16px;
  }
}
</style>
