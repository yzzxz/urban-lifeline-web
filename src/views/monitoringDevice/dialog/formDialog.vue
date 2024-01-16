<template>
  <el-dialog :title="addOrEdit | formatTitle" width="68rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">

    <el-row :gutter="15" type="flex" style="width:100%">
      <el-col :span="10">
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

      <el-col :span="14">
        <el-form ref="form" label-width="8rem" :model="formData" :rules="rules">
          <el-form-item label="设备序列号" prop="deviceCode">
            <el-input v-model="formData.deviceCode" maxlength="50" clearable />
          </el-form-item>
          <el-form-item label="监测内容" prop="checkType">
            <el-select v-model="formData.checkType">
              <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="设备名称" prop="deviceType">
            <el-select v-model="formData.deviceType" placeholder="请输入" maxlength="20" clearable>
              <el-option v-for="item in $store.state.dict.deviceTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="测点编号" prop="deviceName">
            <el-input v-model="formData.deviceName" placeholder="请输入" maxlength="20" clearable />
          </el-form-item>

          <el-form-item label="设备位置" prop="projectId">
            <!--            <el-select v-model="formData.projectId">-->
            <!--              <el-option v-for="item in $store.state.dict.positionList" :key="item.value" :label="item.label" :value="item.value" />-->
            <!--            </el-select>-->
            <dict-select v-model="formData.projectId" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                         :dropdown-params="{checkType:'SBJC'}" />
          </el-form-item>

          <!--          <el-form-item label="设备编码" prop="custom3">-->
          <!--            <el-input v-model="formData.custom3" placeholder="请输入" maxlength="20" clearable />-->
          <!--          </el-form-item>-->

          <!--          <el-form-item label="初始值" prop="custom3">-->
          <!--            <el-input v-model="formData.custom3" placeholder="请输入" maxlength="20" clearable />-->
          <!--          </el-form-item>-->

          <el-form-item label="采样频率" prop="sampleFrequency">
            <el-input v-model="formData.sampleFrequency" placeholder="请输入" maxlength="3" clearable>
              <template #suffix>HZ</template>
            </el-input>
          </el-form-item>

          <el-form-item label="设备坐标" prop="deviceCoordinates">
            <div style="display:flex">
              <el-input v-model="formData.longitude" placeholder="请输入" disabled>
                <template #suffix>经度</template>
              </el-input>
              <span style="margin: 0 1rem"> - </span>
              <el-input v-model="formData.latitude" placeholder="请输入" disabled>
                <template #suffix>纬度</template>
              </el-input>
            </div>

          </el-form-item>

        </el-form>
      </el-col>
    </el-row>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import mapmost from '@mapmost/mapmost-webgl'
export default {
  name: 'TestFormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新增'
      } else if (val === 1) {
        return '编辑'
      } else {
        return '查看'
      }
    }
  },
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
      zoom: 12,
      center: [120.58, 31.30],
      rules: {
        deviceCode: [
          { required: true, message: '请输入设备序列号', trigger: 'blur' }
        ]
      },
      /** 地图相关 */
      map: null,
      markerList: [],
      curPopup: null,
      copyDom: null,
      isFirstShow: true
    }
  },
  watch: {
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
    //   // console.log(e)
    //   this.center = [e.lnglat.lng, e.lnglat.lat]
    //   this.$set(this.formData, 'longitude', e.lnglat.lng)
    //   this.$set(this.formData, 'latitude', e.lnglat.lat)
    //   this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    // },
    handleOpen() {
      if (this.formData.deviceCoordinates) {
        const arr = this.formData.deviceCoordinates.split(',')
        this.$set(this.formData, 'longitude', arr[0] || '')
        this.$set(this.formData, 'latitude', arr[1] || '')
      }
      this.$nextTick(() => {
        // 弹窗打开，清除表单校验
        this.$refs['form'].clearValidate()
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    },
    // 保存或新增项目节点
    handleConfirm() {
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
    }
  }
}
</script>

<style scoped lang="scss">
.el-select,
.el-input {
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
