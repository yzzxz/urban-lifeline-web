<template>
  <el-dialog :title="addOrEdit | formatTitle" width="60rem" append-to-body
             :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">

    <el-row v-if="addOrEdit!==2" :gutter="20" type="flex" style="width:100%">
      <el-col :span="12">
        <div class="dialog-map-container">
          <div id="dialogMapContainer">
            <div v-show="false" id="dialogMarkerBox">
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
            <!-- <el-amap ref="map" :zoom="12" :center="center" default-cursor="pointer" style="width:100%;height:100%" @click="handleMapClick">
          <el-amap-marker :icon="require(`@/assets/images/location.png`)" anchor="bottom-center" :draggable="true"
                          :position="center" @dragend="handleMarkerDragEnd" />
        </el-amap> -->
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <el-form ref="form" :model="formData" :rules="rules" label-width="6rem">
          <!--          <div class="form-title">项目信息</div>-->

          <el-form-item label="项目名称">
            <el-select v-model="formData.projectId" clearable>
              <el-option v-for="item in $store.state.dict.projectList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="项目编码">
            <el-select v-model="formData.projectId" clearable>
              <el-option v-for="item in $store.state.dict.projectList" :key="item.value" :label="item.value" :value="item.value" />
            </el-select>
          </el-form-item>

          <!--          <div class="form-title">基础信息</div>-->

          <el-form-item label="设备名称" prop="deviceName">
            <el-input v-model="formData.deviceName" maxlength="20" clearable />
          </el-form-item>

          <el-form-item label="设备编码" prop="deviceCode">
            <el-input v-model="formData.deviceCode" maxlength="50" clearable />
          </el-form-item>

          <!--   GPS定位系统  -->
          <el-form-item label="设备类型">
            <el-input v-model="formData.deviceType" maxlength="50" clearable />
            <!--            <el-select v-model="formData.deviceType" clearable>-->
            <!--              <el-option v-for="item in devTypeList" :key="item.value" :label="item.label" :value="item.value" />-->
            <!--            </el-select>-->
          </el-form-item>

          <el-form-item label="设备坐标" prop="deviceCoordinates">
            <div style="width:100%;display:flex;">
              <el-input v-model="formData.longitude" placeholder="" disabled style="margin-right: 0;">
                <template #suffix>经度</template>
              </el-input>
              <span style="margin: 0 1rem"> - </span>
              <el-input v-model="formData.latitude" placeholder="" disabled>
                <template #suffix>纬度</template>
              </el-input>
            </div>

          </el-form-item>

          <el-form-item label="IMEI号">
            <el-input v-model="formData.number" maxlength="50" clearable />
          </el-form-item>

          <el-form-item label="图片">
            <div style="width:100%;display: flex">
              <el-upload action="#" :http-request="handleUpload" accept=".jpg,.png" :show-file-list="false" :before-upload="beforeUpload">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>

              <el-image v-if="imageUrl" style="margin-left:1rem; height: 60px" :src="imageUrl" />
            </div>
          </el-form-item>

          <!--          <div class="form-title">通讯信息</div>-->

          <!--          <el-form-item label="启动时间与结束时间">-->
          <!--            <div style="width:20rem;margin-right:2rem" class="flex">-->
          <!--              <el-date-picker v-model="formData.startDate" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="margin-right:0" @change="validDate" />-->
          <!--              <span style="margin:0 0.5rem"> - </span>-->
          <!--              <el-date-picker v-model="formData.endDate" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="margin-right:0" @change="validDate" />-->
          <!--            </div>-->
          <!--          </el-form-item>-->

          <!--          <el-form-item label="通讯IP" prop="messageIp">-->
          <!--            <el-input v-model="formData.messageIp" maxlength="20" />-->
          <!--          </el-form-item>-->

          <!--          <el-form-item label="通讯DNS" prop="messageDns">-->
          <!--            <el-input v-model="formData.messageDns" maxlength="20" />-->
          <!--          </el-form-item>-->

          <!--          <el-form-item label="通讯端口" prop="messagePort">-->
          <!--            <el-input v-model.number="formData.messagePort" maxlength="10" />-->
          <!--          </el-form-item>-->

          <!--          <el-form-item label="采样间隔(S)" prop="sampleInterval">-->
          <!--            <el-input v-model="formData.sampleInterval" maxlength="10" />-->
          <!--          </el-form-item>-->

          <!--          <el-form-item label="出厂日期">-->
          <!--            <el-date-picker v-model="formData.leaveFactoryDate" type="date" value-format="yyyy-MM-dd HH:mm:ss" clearable />-->
          <!--          </el-form-item>-->

          <!--          <el-form-item label="质保日期">-->
          <!--            <el-date-picker v-model="formData.expirationDate" type="date" value-format="yyyy-MM-dd HH:mm:ss" clearable />-->
          <!--          </el-form-item>-->

        </el-form>
      </el-col>
    </el-row>
    <!--  查看历史数据  -->
    <div v-else>
      <!--      -->
      <el-descriptions title="" :column="2" border :label-style="{'text-align':'right','background-color':'#F3F8FC'}">

        <el-descriptions-item label="设备名称">
          {{ formData.deviceName }}
        </el-descriptions-item>

        <el-descriptions-item label="项目名称">
          {{ formatProjectName(formData.projectId) }}
        </el-descriptions-item>

        <el-descriptions-item label="设备编码">
          {{ formData.deviceCode }}
        </el-descriptions-item>

        <el-descriptions-item label="项目编码">
          {{ formatProjectCode(formData.projectId) }}
        </el-descriptions-item>

        <el-descriptions-item label="设备类型">
          {{ formData.deviceType }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form class="query-form" :model="query" inline label-width="5rem" style="margin: 1rem 0;border-bottom: 1px solid #ebeef5">
        <el-form-item label="时间">
          <el-date-picker v-model="collectionTime" type="datetimerange" range-separator=" - " value-format="yyyy-MM-dd HH:mm:ss"
                          start-placeholder="开始时间" end-placeholder="结束时间" :clearable="false" />
        </el-form-item>

        <el-form-item label=" ">
          <el-button type="primary" icon="el-icon-search" @click="getList">查 询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleResetQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <el-table ref="tableWrapper" v-loading="tableLoading" border :data="tableData"
                :header-cell-style="$store.state.settings.tableHeaderStyle" height="420">
        <el-table-column label="序号" width="60" align="center" />
        <el-table-column prop="collectionTime" label="时间" min-width="120">
          <template v-slot="scope">
            {{ scope.row.collectionTime | dateTimeFilter }}
          </template>
        </el-table-column>
        <el-table-column prop="sensorValue" label="GPS位置" min-width="120" />

        <template #empty>
          <el-empty :image-size="80" />
        </template>
      </el-table>

    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>

    <el-dialog title="位置选择" />
  </el-dialog>
</template>

<script>
import FileUpload from '@/mixin/FileUpload'
import { validIP, validDNS, validNumberGt0 } from '@/utils/validate'
import BaseCurd from '@/mixin/BaseCurd'
import { getFilePath } from '@/utils'
import mapmost from '@mapmost/mapmost-webgl'
export default {
  name: 'DeviceFormDialog',

  components: {},
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新增设备'
      } else if (val === 1) {
        return '编辑'
      } else {
        return '查看历史数据'
      }
    }
  },
  mixins: [FileUpload, BaseCurd],
  props: {
    formData: {
      required: true,
      type: Object
    },
    isShow: {
      type: Boolean,
      default: false
    },
    addOrEdit: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      uri: '/api/scl/v1/scl/sclDeviceData/',
      collectionTime: [], // 查询时间
      query: {
        devSn: ''
      },
      pageSize: -1,
      pageNum: -1,
      curdMountedMixin: false,
      zoom: 12,
      center: [120.58, 31.30],

      // devTypeList: [
      //   {
      //     label: 'GPS定位系统',
      //     value: 'GPS'
      //   }
      // ],
      rules: {
        deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        deviceCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
        projectId: [{ required: true, message: '请选择项目名称', trigger: 'blur' }],
        deviceType: [{ required: true, message: '请选择设备类型', trigger: 'blur' }],
        messageIp: [{ validator: validIP, trigger: 'blur' }],
        messageDns: [{ validator: validDNS, trigger: 'blur' }],
        sampleInterval: [{ validator: validNumberGt0, trigger: 'blur' }]
      },
      /** 地图相关 */
      map: null,
      markerList: [],
      curPopup: null,
      copyDom: null,
      isFirstShow: true
    }
  },
  computed: {
    imageUrl() {
      return getFilePath(this.formData.picture)
    }
  },
  watch: {
    collectionTime: {
      handler: function(val) {
        if (val && val.length) {
          this.$set(this.query, 'collectionTimeStart', val[0])
          this.$set(this.query, 'collectionTimeEnd', val[1])
        } else {
          delete this.query['collectionTimeStart']
          delete this.query['collectionTimeEnd']
        }
      },
      deep: true,
      immediate: true
    },
    isShow: {
      handler(newVal, oldVal) {
        if (newVal === true && this.isFirstShow) {
          this.isFirstShow = false
          this.createdMap()
        }
      },

      immediate: false
    }
  },
  methods: {
    createdMap() {
      const that = this
      const map = new mapmost.Map({
        container: 'dialogMapContainer', // your HTML element id
        style: this.$mapMostStyle, // styleJson, // // 详见 https://www.mapmost.com/mapmost_docs/webgl/latest/docs/map-style
        center: this.center, // [120.58, 31.3], // 起始坐标
        zoom: this.zoom, // 起始缩放等级
        userId: this.$mapMostUserId // 授权码,正式环境要更换成 对方的
      })
      // 设置一个在地图加载完成时触发的事件监听器。
      map.on('click', (e) => {
        that.handleMapClick(e)
      })

      that.map = map
      setTimeout(() => {
        that.createMarker()
      }, 200)
    },
    createMarker() {
      const that = this
      const map = that.map
      const domTemp = document.getElementById('dialogMarkerBox').childNodes
      const markerBoxHtml = domTemp[0].outerHTML // 获取html
      const newMarkerDiv = document.createElement('div')
      newMarkerDiv.setAttribute('id', 'dialogMarkerId')
      newMarkerDiv.setAttribute('class', 'dialogMarkerBox-marker')
      newMarkerDiv.innerHTML = markerBoxHtml
      // 创建 marker
      const m1 = new mapmost.Marker({
        offset: [0, 25], // [正右，正下]
        element: newMarkerDiv,
        draggable: true
      }).setLngLat(that.center)
        .addTo(map)

      m1.on('dragend', e => {
        that.handleMarkerDragEnd(e.target._lngLat)
      })
      this.markerList = []
      that.markerList.push(m1)
    },
    handleMapClick(e) {
      this.center = [e.lngLat.lng.toFixed(6), e.lngLat.lat.toFixed(6)]
      this.markerList[0].setLngLat(this.center)
      this.$set(this.formData, 'longitude', this.center[0])
      this.$set(this.formData, 'latitude', this.center[1])
      this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    },
    handleMarkerDragEnd(lngLat) {
      this.center = [lngLat.lng.toFixed(6), lngLat.lat.toFixed(6)]
      this.$set(this.formData, 'longitude', this.center[0])
      this.$set(this.formData, 'latitude', this.center[1])
      this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    },
    // handleMarkerDragEnd(e) {
    //   this.center = [e.lnglat.KL.toFixed(6), e.lnglat.kT.toFixed(6)]
    //   //
    //   this.$set(this.formData, 'longitude', this.center[0])
    //   this.$set(this.formData, 'latitude', this.center[1])
    //   this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    // },
    // handleMapClick(e) {
    //   this.center = [e.lnglat.lng, e.lnglat.lat]
    //   this.$set(this.formData, 'longitude', e.lnglat.lng)
    //   this.$set(this.formData, 'latitude', e.lnglat.lat)
    // this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    // },

    // 启动时间与结束时间校验
    validDate() {
      if (this.formData.startDate && this.formData.endDate &&
        this.$dayjs(this.formData.startDate).isAfter(this.$dayjs(this.formData.endDate))) {
        this.formData.endDate = ''
        return this.$message.warning('启动时间不能大于结束时间')
      }
    },
    handleChangeProject(type) {
      if (type === 'id') {
        this.$set(this.formData, 'projectCode', this.$store.state.dict.projectList.find(i => i.value === this.formData.projectId)?.code || '')
      } else if (type === 'code') {
        this.$set(this.formData, 'projectId', this.$store.state.dict.projectList.find(i => i.code === this.formData.projectCode)?.value || '')
      }
    },
    // 搜索重置
    handleResetQuery() {
      // 默认查询最近24h
      this.collectionTime = [
        this.$dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        this.$dayjs().format('YYYY-MM-DD HH:mm:ss')
      ]
      this.query = {
        devSn: this.formData.deviceCode,
        collectionTimeStart: this.collectionTime[0],
        collectionTimeEnd: this.collectionTime[1]
      }

      this.getList()
    },
    handleOpen() {
      if (this.formData.deviceCoordinates) {
        const arr = this.formData.deviceCoordinates.split(',')
        this.$set(this.formData, 'longitude', arr[0] || '')
        this.$set(this.formData, 'latitude', arr[1] || '')
      }

      // 查看历史数据
      if (this.addOrEdit === 2) {
        this.handleResetQuery()
      }

      if (this.formData.projectId) {
        this.handleChangeProject('id')
      }
      this.$nextTick(() => {
        // 弹窗打开，清除表单校验
        this.$refs['form'].clearValidate()
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    },

    // 上传图片
    handleUpload(param) {
      this.uploadFile(param, {
        folder: 'scl/machine'
      },
      (filePath) => {
        this.$set(this.formData, 'picture', filePath)
      }
      )
    },

    // 保存或新增
    handleConfirm() {
      if (this.addOrEdit === 2) {
        this.$emit('closeDialog', 0)
      }
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const para = {
            ...this.formData,
            // 经纬度,拼接
            deviceCoordinates: `${this.formData.longitude},${this.formData.latitude}`
          }
          if (this.addOrEdit === 0) {
            this.$emit('addFormData', para)
          } else {
            this.$emit('editFormData', para)
          }
        } else {
          return this.$message({
            type: 'warning',
            message: '表单校验失败, 请检查输入!'
          })
        }
      })
    },

    formatProjectName(cellVal) {
      return (
        this.$store.state.dict.projectList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatProjectCode(cellVal) {
      return (
        this.$store.state.dict.projectList.find((i) => i.value === cellVal)
          ?.code || cellVal
      )
    }
  }
}

</script>

<style scoped lang="scss" >
.el-select,
.el-input,
.el-date-editor,
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.dialog-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  #dialogMapContainer{
    position: absolute;
    top:0;
    bottom:0;
    width:100%;

  }

::v-deep .mapmostgl-canvas-container.mapmostgl-interactive, .mapmostgl-ctrl-group button.mapmostgl-ctrl-compass{
  cursor: pointer;
}

}
</style>
