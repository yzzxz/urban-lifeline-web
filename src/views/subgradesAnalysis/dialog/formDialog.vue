<template>
  <el-dialog :title="addOrEdit | formatTitle" width="70rem" top="4rem" append-to-body :close-on-click-modal="true" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-descriptions :column="2" border
                     :label-style="{'text-align':'right','width':'18rem', 'background-color':'#F3F8FC', 'line-height':'32px',padding:'0 5px'}"
                     :content-style="{'line-height':'36px',padding:'0 5px'}">
      <el-descriptions-item label="编号">{{ formData.diseaseNumber }}</el-descriptions-item>
      <el-descriptions-item label="道路名称">{{ formatWayName(formData.wayName) }}</el-descriptions-item>
      <el-descriptions-item label="病害体类型">{{ formatDiseaseSort(formData.diseaseSort) }}</el-descriptions-item>
      <el-descriptions-item label="病害体文件编号">{{ formData.fileNumber }}</el-descriptions-item>
      <el-descriptions-item label="病害体顶底深 (m)">{{ formData.topDepth }}</el-descriptions-item>
      <el-descriptions-item label="病害体经纬度位置">{{ formData.coordinatesOrientation }}</el-descriptions-item>
      <el-descriptions-item label="平面面积 (m²)">{{ formData.planeSize }}</el-descriptions-item>
      <el-descriptions-item label="尺寸 (m)">{{ formData.size }}</el-descriptions-item>
      <el-descriptions-item label="病害体坐标位置">{{ formData.abnormalLocation }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions direction="vertical" :column="2" border
                     :label-style="{'text-align':'center','width':'50%','background-color':'#F3F8FC', 'line-height':'32px',padding:'0 5px'}"
                     :content-style="{'text-align':'center', 'line-height':'36px'}">
      <el-descriptions-item label="探测雷达图谱">
        <el-image :src="formData.radarMap | imageUrlFilter" :preview-src-list="formData.radarMap | formatPreviewSrcList"
                  style="height: 120px">
          <div slot="error" class="image-slot">
            <span>无对应图片</span>
          </div>
        </el-image>
      </el-descriptions-item>
      <el-descriptions-item label="地图">
        <el-image :src="formData.imageData | imageUrlFilter" :preview-src-list="formData.imageData | formatPreviewSrcList"
                  style="height: 120px">
          <div slot="error" class="image-slot">
            <span>无对应图片</span>
          </div>
        </el-image>
      </el-descriptions-item>
      <el-descriptions-item label="复核验证">
        <el-image :src="formData.replicaSection | imageUrlFilter" :preview-src-list="formData.replicaSection | formatPreviewSrcList"
                  style="height: 120px">
          <div slot="error" class="image-slot">
            <span>无对应图片</span>
          </div>
        </el-image>
      </el-descriptions-item>
      <el-descriptions-item label="现场图片">
        <el-image :src="formData.verificationAchievement | imageUrlFilter"
                  :preview-src-list="formData.verificationAchievement | formatPreviewSrcList" style="height: 120px">
          <div slot="error" class="image-slot">
            <span>无对应图片</span>
          </div>
        </el-image>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions :column="1" border
                     :label-style="{'text-align':'right','width':'18rem','background-color':'#F3F8FC', 'line-height':'32px',padding:'0 5px'}"
                     :content-style="{'line-height':'36px',padding:'0 5px'}">
      <el-descriptions-item label="道路现状">{{ formData.currentState }}</el-descriptions-item>
      <el-descriptions-item label="病害体周边管线相对位置">{{ formData.diseaseAddr }}</el-descriptions-item>
      <el-descriptions-item label="初步成因分析">{{ formData.preliminaryCausal }}</el-descriptions-item>
      <el-descriptions-item label="塌陷发生可能性">{{ formData.riskAssessment }}</el-descriptions-item>
      <el-descriptions-item label="处置建议">{{ formData.disposalProposal }}</el-descriptions-item>
    </el-descriptions>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getToken } from '@/utils/auth'
import { getFilePath } from '@/utils'
export default {
  name: 'RobbedFormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新增'
      } else if (val === 1) {
        return '编辑'
      } else {
        return '详情'
      }
    },
    formatPreviewSrcList(val) {
      return [getFilePath(val)]
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
    },

    positionList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    token() {
      return getToken()
    }
  },
  methods: {
    handleOpen() {
      // this.$nextTick(() => {
      //   // 弹窗打开，清除表单校验
      //   this.$refs['form'].clearValidate()
      // })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    },
    // 保存或新增项目节点
    handleConfirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.addOrEdit === 0) {
            this.$emit('addFormData', this.formData)
          } else {
            this.$emit('outputFormData', this.formData)
          }
        } else {
          return this.$message({
            type: 'warning',
            message: '表单校验失败, 请检查输入!'
          })
        }
      })
    },

    formatWayName(cellVal) {
      return (
        this.positionList.find((i) => i.value === cellVal)?.label || cellVal
      )
    },
    formatDiseaseSort(cellVal) {
      return (
        this.$store.state.dict.roadbedTypeList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
