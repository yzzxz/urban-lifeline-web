<template>
  <el-dialog :title="addOrEdit | formatTitle" width="80rem" top="4rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" class="padding-dialog" @open="handleOpen">
    <el-form ref="form" :model="formData" :rules="rules" inline label-position="top" class="form-top-label">

      <el-form-item label="病害编号" prop="diseaseNumber">
        <el-input v-model="formData.diseaseNumber" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="道路名称" prop="wayName">
        <dict-select v-model="formData.wayName" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                     :dropdown-params="{checkType:'BHFX'}" clearable />
      </el-form-item>

      <el-form-item label="病害类别" prop="diseaseSort">
        <el-select v-model="formData.diseaseSort" placeholder="请选择" clearable>
          <el-option v-for="item in $store.state.dict.roadbedTypeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="病害体文件号" prop="fileNumber">
        <el-input v-model="formData.fileNumber" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="病害体顶底深(m)" prop="topDepth">
        <el-input v-model="formData.topDepth" maxlength="20" clearable>
          <template #suffix>m</template>
        </el-input>
      </el-form-item>

      <el-form-item label="尺寸(m)" prop="size">
        <el-input v-model="formData.size" maxlength="20" clearable />
      </el-form-item>

      <el-form-item label="平面面积(m²)" prop="planeSize">
        <el-input v-model="formData.planeSize" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="经纬度定位" prop="coordinatesOrientation">
        <el-input v-model="formData.coordinatesOrientation" maxlength="50" clearable placeholder="经纬度定位(格式为: 经度,纬度)" />
      </el-form-item>

      <el-form-item label="坐标定位" prop="abnormalLocation">
        <el-input v-model="formData.abnormalLocation" maxlength="50" clearable placeholder="坐标定位(格式为: 坐标X,坐标Y)" />
      </el-form-item>

      <el-form-item label="道路现状" prop="currentState">
        <el-input v-model="formData.currentState" maxlength="300" clearable />
      </el-form-item>
      <el-form-item label="病害体周边管线相对位置" prop="diseaseAddr">
        <el-input v-model="formData.diseaseAddr" maxlength="200" clearable />
      </el-form-item>
      <el-form-item label="初步成因分析" prop="preliminaryCausal">
        <el-input v-model="formData.preliminaryCausal" maxlength="300" clearable />
      </el-form-item>

      <el-form-item label="塌陷发生可能性" prop="riskAssessment">
        <el-select v-model="formData.riskAssessment" clearable>
          <el-option v-for="key in Object.keys($store.state.dict.roadRiskLevel)" :key="key" :label="$store.state.dict.roadRiskLevel[key].label" :value="key" />
        </el-select>
      </el-form-item>

      <el-form-item label="处置建议" prop="disposalProposal">
        <el-input v-model="formData.disposalProposal" maxlength="300" clearable />
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="探测雷达图谱">
            <div class="flex" style="width:100%">
              <el-upload action="#" :http-request="(param)=>{handleUpload(param, 'radarMap')}" accept=".jpg,.jpeg,.png" :show-file-list="false"
                         :before-upload="beforeUpload">
                <el-button type="primary" size="small">点击上传</el-button>
              </el-upload>

              <el-image :src="radarMapUrl" :preview-src-list="[radarMapUrl]" style="margin-left:1rem;height: 60px;border-radius: 2px">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
            </div>

          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="地图">
            <div class="flex" style="width:100%">
              <el-upload action="#" :http-request="(param)=>{handleUpload(param,'imageData')}" accept=".jpg,.jpeg,.png"
                         :show-file-list="false" :before-upload="beforeUpload">
                <el-button type="primary" size="small">点击上传</el-button>
              </el-upload>

              <el-image :src="imageDataUrl" :preview-src-list="[imageDataUrl]" style="margin-left:1rem;height: 60px;border-radius: 2px">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="复核验证">
            <div class="flex" style="width:100%">
              <el-upload action="#" :http-request="(param)=>{handleUpload(param,'replicaSection')}" accept=".jpg,.jpeg,.png"
                         :show-file-list="false" :before-upload="beforeUpload">
                <el-button type="primary" size="small">点击上传</el-button>
              </el-upload>

              <el-image :src="replicaSectionUrl" :preview-src-list="[replicaSectionUrl]" style="margin-left:1rem;height: 60px;border-radius: 2px">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
            </div>
          </el-form-item>

        </el-col>

        <el-col :span="12">
          <el-form-item label="现场图片">
            <div class="flex" style="width:100%">
              <el-upload action="#" :http-request="(param)=>{handleUpload(param,'verificationAchievement')}" accept=".jpg,.jpeg,.png"
                         :show-file-list="false" :before-upload="beforeUpload">
                <el-button type="primary" size="small">点击上传</el-button>
              </el-upload>

              <el-image :src="verificationAchievementUrl" :preview-src-list="[verificationAchievementUrl]"
                        style="margin-left:1rem;height: 60px;border-radius: 2px">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import FileUpload from '@/mixin/FileUpload'
import { getFilePath } from '@/utils'
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

      rules: {
        diseaseNumber: [
          { required: true, message: '请输入病害编号', trigger: 'blur' }
        ],
        wayName: [
          { required: true, message: '请选择道路', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 雷达图谱
    radarMapUrl() {
      return getFilePath(this.formData.radarMap)
    },
    // 复核验证
    replicaSectionUrl() {
      return getFilePath(this.formData.replicaSection)
    },

    // 影像资料
    imageDataUrl() {
      return getFilePath(this.formData.imageData)
    },

    // 现场照片
    verificationAchievementUrl() {
      return getFilePath(this.formData.verificationAchievement)
    }
  },
  methods: {
    handleOpen() {
      // 初始化摄像头功能选择
      this.$set(
        this.formData,
        'functionName',
        this.formData.functionName?.split(';') || []
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
    handleUpload(param, prop) {
      this.uploadFile(
        param,
        {
          folder: 'scl/camera'
        },
        (filePath) => {
          this.$set(this.formData, prop, filePath)
        }
      )
    },
    // 保存或新增项目节点
    handleConfirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const para = { ...this.formData }
          para.taskId = this.$route.query.taskId
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
.el-date-editor {
  width: 20rem;
  margin-right: 2rem;
}
</style>
