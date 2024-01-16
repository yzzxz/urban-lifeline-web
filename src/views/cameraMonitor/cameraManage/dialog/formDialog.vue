<template>
  <el-dialog :title="addOrEdit | formatTitle" width="86rem" top="5rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
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
          <el-amap-marker :icon="require(`@/assets/images/location.png`)" anchor="bottom-center" :draggable="true" :position="center"
                          @dragend="handleMarkerDragEnd" />
        </el-amap> -->
          </div>
        </div>
      </el-col>

      <el-col :span="14">
        <el-form ref="form" :model="formData" :rules="rules" inline label-position="top" class="form-top-label">
          <el-form-item label="设备名称" prop="camName">
            <el-input v-model="formData.camName" maxlength="50" clearable />
          </el-form-item>
          <el-form-item label="设备类型" prop="camType">
            <el-select v-model="formData.camType">
              <el-option label="枪机" value="1" />
              <el-option label="球机" value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="序列号" prop="camSerialNo">
            <el-input v-model="formData.camSerialNo" placeholder="请输入" maxlength="50" clearable />
          </el-form-item>
          <el-form-item label="项目名称" prop="projectId">
            <el-select v-model="formData.projectId">
              <el-option v-for="item in $store.state.dict.projectList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="设备位置" prop="address">
            <el-input v-model="formData.address" placeholder="请输入" maxlength="100" clearable />
          </el-form-item>

          <el-form-item label="设备坐标">
            <div class="flex" style="width:20rem">
              <el-input v-model="formData.longitude" placeholder="点选地图" maxlength="20" disabled style="margin-right:0">
                <template #suffix>经度</template>
              </el-input>
              <span style="margin: 0 0.5rem"> - </span>
              <el-input v-model="formData.latitude" placeholder="点选地图" maxlength="20" disabled style="margin-right:0">
                <template #suffix>纬度</template>
              </el-input>
            </div>
          </el-form-item>

          <el-form-item label="视频流地址" prop="linkAddress">
            <el-input v-model="formData.linkAddress" placeholder="请输入" maxlength="200" clearable />
          </el-form-item>

          <el-form-item label="功能" prop="functionName">
            <!--        <el-input v-model="formData.functionName" placeholder="请输入" maxlength="100" clearable />-->
            <el-select v-model="formData.functionName" clearable multiple collapse-tags>
              <el-option v-for="item in $store.state.dict.funcList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="备用视频流地址" prop="linkAddress2">
            <el-input v-model="formData.linkAddress2" placeholder="请输入" maxlength="200" clearable />
          </el-form-item>

          <el-form-item label="视频子码流地址" prop="linkAddress3">
            <el-input v-model="formData.linkAddress3" placeholder="请输入" maxlength="200" clearable />
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="formData.remarks" placeholder="请输入" maxlength="200" clearable />
          </el-form-item>

          <el-form-item label="摄像头背景图">
            <el-upload action="#" :http-request="handleUpload" accept=".jpg,.jpeg,.png" :show-file-list="false"
                       :before-upload="beforeUpload">
              <el-button type="primary" size="small">点击上传</el-button>
            </el-upload>

            <el-image v-if="imageUrl" :src="imageUrl" :preview-src-list="[imageUrl]"
                      style="margin-top:1rem;height: 60px;border-radius: 2px" />
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
import FileUpload from '@/mixin/FileUpload'
import { getFilePath } from '@/utils'
import mapmost from '@mapmost/mapmost-webgl'
export default {
  name: 'CameraFormDialog',
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
  mixins: [FileUpload],
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
      center: [120.58, 31.3],
      rules: {
        param: [{ required: true, message: '请输入', trigger: 'blur' }]
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
      return getFilePath(this.formData.imgPath)
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
      this.$set(this.formData, 'longitude', this.center[0])
      this.$set(this.formData, 'latitude', this.center[1])
      this.markerList[0].setLngLat(this.center)
      // this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    },
    handleMarkerDragEnd(lngLat) {
      this.center = [lngLat.lng.toFixed(6), lngLat.lat.toFixed(6)]
      this.$set(this.formData, 'longitude', this.center[0])
      this.$set(this.formData, 'latitude', this.center[1])
      // this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    },
    // handleMarkerDragEnd(e) {
    //   this.center = [e.lnglat.KL.toFixed(6), e.lnglat.kT.toFixed(6)]
    //   //
    //   this.$set(this.formData, 'longitude', this.center[0])
    //   this.$set(this.formData, 'latitude', this.center[1])
    //   // this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    // },
    // handleMapClick(e) {
    //   // console.log(e)
    //   this.center = [e.lnglat.lng, e.lnglat.lat]
    //   this.$set(this.formData, 'longitude', e.lnglat.lng)
    //   this.$set(this.formData, 'latitude', e.lnglat.lat)
    //   // this.$set(this.formData, 'deviceCoordinates', this.center.join(','))
    // },
    handleOpen() {
      // 初始化摄像头功能选择
      this.$set(
        this.formData,
        'functionName',
        this.formData.functionName?.split(';').filter((item) => !!item) || []
      )

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
      this.uploadFile(
        param,
        {
          folder: 'scl/camera'
        },
        (filePath) => {
          this.$set(this.formData, 'imgPath', filePath)
        }
      )
    },
    // 保存或新增项目节点
    handleConfirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const para = { ...this.formData }
          para.functionName = this.formData.functionName?.join(';')
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
.el-input,
.el-date-editor,
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 20rem;
  margin-right: 2rem;
}

.form-top-label {
  ::v-deep.el-form-item .el-form-item__label {
    padding-bottom: 0 !important;
  }
}

.dialog-map-container {
  position: relative;
  width: 100%;
  height: 100%;

  padding:1px;
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
