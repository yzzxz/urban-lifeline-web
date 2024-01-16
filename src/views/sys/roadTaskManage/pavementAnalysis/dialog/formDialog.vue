<template>
  <el-dialog :title="addOrEdit | formatTitle" width="42rem" top="5rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" :model="formData" :rules="rules" label-width="6rem">

      <el-form-item label="巡查病害" prop="patrolVirus">
        <!-- <el-input v-model="formData.patrolVirus" maxlength="50" clearable /> -->
        <el-select v-model="formData.patrolVirus" placeholder="请选择" clearable>
          <el-option v-for="item in $store.state.dict.pavementList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="道路名称" prop="wayName">
        <!--        <el-select v-model="formData.wayName">-->
        <!--          <el-option v-for="item in positionList" :key="item.value" :label="item.label" :value="item.value" />-->
        <!--        </el-select>-->
        <dict-select v-model="formData.wayName" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                     :dropdown-params="{checkType:'BHFX'}" />
      </el-form-item>

      <el-form-item label="道路范围" prop="roadSectionName">
        <el-input v-model="formData.roadSectionName" maxlength="200" clearable />
      </el-form-item>

      <el-form-item label="病害编号" prop="virusNumber">
        <el-input v-model="formData.virusNumber" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="病害位置" prop="diseaseAddr">
        <el-input v-model="formData.diseaseAddr" maxlength="200" clearable />
      </el-form-item>

      <el-form-item label="病害信息">
        <el-upload action="#" :http-request="handleUpload" accept=".jpg,.jpeg,.png" :show-file-list="false" :before-upload="beforeUpload">
          <el-button type="primary" size="small">点击上传</el-button>
        </el-upload>

        <el-image v-if="imageUrl" :src="imageUrl" :preview-src-list="[imageUrl]" style="margin-top:1rem;height: 100px;border-radius: 2px" />
      </el-form-item>

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
  name: 'PavementFormDialog',
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
        virusNumber: [
          { required: true, message: '请输入病害编号', trigger: 'blur' }
        ],
        wayName: [{ required: true, message: '请选择道路', trigger: 'blur' }]
      }
    }
  },
  computed: {
    imageUrl() {
      return getFilePath(this.formData.picture)
    }
  },
  methods: {
    handleOpen() {
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
          folder: 'scl/road'
        },
        (filePath) => {
          this.$set(this.formData, 'picture', filePath)
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
 width: 100%;
}
</style>
