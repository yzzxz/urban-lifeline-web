<template>
  <div class="app-container">

    <div class="map-container">
      <div id="mapContainer">
        <div v-show="false" id="poupBox">
          <map-info-window :camera-data="cameraData" />
        </div>
        <div v-show="false" id="markerBox">
          <div class="map-marker"
               style="position: absolute; top: 296.835px; left: 81.6273px; transform-origin: 28px 74px; z-index: 12;
              display: block; pointer-events: auto; transform: translate(-28px, -74px) scale(1) rotate(0deg);">
            <div class="amap-icon" style="overflow: hidden; width: 56px; height: 72px;">
              <img
                :src="require(`@/assets/images/camera-red.png`)">
            </div>
          </div>
        </div>
      </div>

      <!-- <el-amap ref="map" :zoom="zoom" :center="center" map-style="amap://styles/whitesmoke">
        <template v-for="marker in cameraList">
          <el-amap-marker v-if="marker.longitude && marker.latitude" :key="marker.id" :icon="require(`@/assets/images/camera-red.png`)"
                          :offset="[-28,-74]" :position="[marker.longitude, marker.latitude]" @click="(e)=>{handleClickMarker(marker,e)}" />
        </template>
        <el-amap-info-window :position="cameraData.position" :visible.sync="infoWindowVisible" :is-custom="true">
          <map-info-window :camera-data="cameraData" @closeWindow="infoWindowVisible=false" />
        </el-amap-info-window>
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
        <el-select v-model="query.camType" clearable>
          <el-option label="枪机" :value="1" />
          <el-option label="球机" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="告警类型">
        <el-select v-model="query.funcId">
          <el-option v-for="item in funcList" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-table-column type="selection" width="55" :reserve-selection="true" align="center" />
        <el-table-column label="序号" width="60">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="camName" label="设备名称" min-width="120" />
        <el-table-column prop="camType" label="设备类型" min-width="120">
          <template v-slot="scope">
            <el-tag v-if="scope.row.camType==='1'" type="success">枪机</el-tag>
            <el-tag v-else-if="scope.row.camType==='2'" type="primary">球机</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="areaNo" label="项目名称" min-width="120" :formatter="formatProjectName" />

        <el-table-column prop="funcId" label="功能" min-width="120">
          <template v-slot="scope">
            <!--  -->
            <!--            {{ scope.row.functionName }}-->
            <el-tag size="small" style="margin-right: 0.5rem;margin-bottom: 0.5rem">
              {{ formatFunctionName(scope.row.funcId) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="" label="图片" min-width="110" align="center">
          <template slot-scope="scope">
            <el-image :src="scope.row | formatImgSrc" :preview-src-list="scope.row | formatImgSrcList" style="height: 4rem">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline" />
              </div>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="timeStramp" label="发生时间" min-width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.timeStramp | dateTimeFilter }}
          </template>
        </el-table-column>

        <el-table-column prop="abnormalFlag" label="是否异常" min-width="110" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.abnormalFlag === '1'" style="color:#ff0000">是</span>
            <span v-else>否</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleView(scope.row)">
              详情
            </el-link>
            <el-divider direction="vertical" />
            <!--            <el-popconfirm title="确定要销项吗?" @confirm="()=>handleCancel(scope.row)">-->
            <!--              <el-link slot="reference" type="primary" :underline="false">-->
            <!--                销项-->
            <!--              </el-link>-->
            <!--            </el-popconfirm>-->
            <el-link type="primary" :underline="false" @click="handleEdit(scope.row)">
              销项
            </el-link>
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
import MapInfoWindow from './dialog/mapInfoWindow.vue'
import { getToken } from '@/utils/auth'
import mapmost from '@mapmost/mapmost-webgl'
export default {
  name: 'CameraManage',
  components: {
    FormDialog,
    MapInfoWindow

  },
  filters: {
    formatImgSrc(row) {
      let type = 'jpg'
      if (row.funcId === 'inbreak') {
        type = 'gif'
      }
      return `/upload/secImage/${row.funcId}/${
        row.bizId
      }.${type}?token=${getToken()}`
    },
    formatImgSrcList(row) {
      let type = 'jpg'
      if (row.funcId === 'inbreak') {
        type = 'gif'
      }
      return [
        `/upload/secImage/${row.funcId}/${
          row.bizId
        }.${type}?token=${getToken()}`
      ]
    }
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/sec/v1/sec/secJoin/',
      deleteAllId: 'secJoinIds',

      zoom: 15,
      center: [120.6666, 31.3337], // [120.58, 31.3],

      // 告警设备列表
      cameraList: [],
      infoWindowVisible: false,
      cameraData: {},
      /** 地图相关 */
      map: null,
      markerList: [],
      curPopup: null,
      copyDom: null
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
    cameraList: {
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.createMarker(newVal)
        }
      },
      immediate: true
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
  activated() {},
  mounted() {
    this.getCameraList()
    this.copyDom = document.getElementById('poupBox').childNodes[0]
  },
  methods: {

    createMarker(markerArr) {
      const that = this
      markerArr.map((item) => {
        const markerBoxHtml = document.getElementById('markerBox').childNodes[0].outerHTML // 获取html
        const newMarkerDiv = document.createElement('div')
        newMarkerDiv.setAttribute('id', item.id)
        newMarkerDiv.setAttribute('class', 'markerBox-marker')
        newMarkerDiv.innerHTML = markerBoxHtml
        const m1 = new mapmost.Marker({
          offset: [0, 36], // [正右，正下]
          element: newMarkerDiv
        })
          .setLngLat([item.longitude, item.latitude])
          .addTo(that.map)
        // 创建 marker
        that.markerList.push(m1)
      })
      const markerDOmList = document.getElementsByClassName('markerBox-marker')
      for (let i = 0; i < markerDOmList.length; i++) {
        markerDOmList[i].addEventListener('click', () => {
          if (this.curPopup) {
            this.curPopup.remove()
          }
          this.cameraData = {
            ...markerArr[i],
            position: [markerArr[i].longitude, markerArr[i].latitude]
          }
          const componentTemp = this.copyDom // document.getElementById('poupBox').childNodes[0] // JSON.parse(JSON.stringify())  //获取html

          // const htmlCode = componentTemp.childNodes[0].outerHTML // 获取组件的HTML代码
          // const tempDiv = document.createElement('div')
          // tempDiv.innerHTML = htmlCode

          // 添加popup
          // var markerHeight = 50; var markerRadius = 10; var linearOffset = 25
          var popupOffsets = {
            'top': [0, 0],
            'top-left': [0, 0],
            'top-right': [0, 0]
          }

          this.curPopup = new mapmost.Popup({ offset: popupOffsets, className: 'my-class', focusAfterOpen: true, closeOnClick: false })
            .setLngLat([markerArr[i].longitude, markerArr[i].latitude])
            .setDOMContent(componentTemp)
            .addTo(that.map)

          this.curPopup.on('close', () => {
            that.curPopup = null
          })
        })
      }
    },
    // handleClickMarker(marker, e) {
    //   console.log(marker, e)
    //   this.cameraData = {
    //     ...marker,
    //     position: [marker.longitude, marker.latitude]
    //   }
    //   this.infoWindowVisible = true
    // },
    // 获取告警设备列表
    getCameraList() {
      this.$http({
        url: '/api/sec/v1/sec/secCamera/listWarnCount',
        method: 'get',
        params: {
          startDate: this.$dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
          endDate: this.$dayjs().format('YYYY-MM-DD')
        }
      }).then((res) => {
        if (res.code === 1 && res.data) {
          this.cameraList = res.data
        }
      })
    },
    // 详情
    handleView(row) {
      this.formData = {
        ...row,
        funcIdName: this.formatFunctionName(row.funcId),
        projectName: this.formatProjectName('', '', row.projectId)
      }
      this.addOrEdit = 2
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.formData = {
        ...row,
        funcIdName: this.formatFunctionName(row.funcId),
        projectName: this.formatProjectName('', '', row.projectId)
      }
      this.addOrEdit = 1
      this.dialogVisible = true
    },
    // 销项
    handleCancel(row) {
      const para = {
        id: row.id,
        cancelFlag: 1
      }
      this.editFormData(para)
    },

    formatFunctionName(code) {
      return this.funcList.find((i) => i.value === code)?.label || code
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

}

  }

    .marker {
      width: 34px;
      height: 34px;
      background-image: url(https://www.mapmost.com/mapmost_docs/webgl/latest/demoScript/img/Mapmost.png);
      background-size: 100%;

  }

  .poup-div-show{
    visibility:visible
  }
  .poup-div-hidden{
    visibility:hidden
  }
}
</style>
