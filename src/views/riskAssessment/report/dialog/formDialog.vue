<template>
  <el-dialog :title="addOrEdit | formatTitle" width="50rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="8rem" :model="formData" :rules="rules" :disabled="addOrEdit === 2">
      <el-form-item label="报告名称" prop="name">
        <el-input v-model="formData.name" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="">
        <el-upload action="#" :http-request="handleUpload" accept=".doc,.docx,.pdf" :file-list="fileUrlList" :limit="1" :before-upload="beforeUpload">
          <el-button type="primary" size="small">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传 word/pdf 文件，且不超过 50 Mb</div>
        </el-upload>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getFilePath, getUUID } from '@/utils'
import FileUpload from '@/mixin/FileUpload'

export default {
  name: 'ReportFormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '上传报告'
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
        name: [{ required: true, message: '请输入报告名称', trigger: 'blur' }]
      },

      fileUrlList: []
    }
  },
  computed: {

  },
  methods: {
    handleUpload(param) {
      this.uploadFile(param,
        { folder: 'scl/evaluationReport' },
        (path) => {
          this.formData.filePath.push(path)
          this.fileUrlList.push({
            uuid: getUUID(32),
            name: path.replace('scl/evaluationReport/', ''),
            url: getFilePath(path)
          })
        }
      )
    },
    handleOpen() {
      if (this.addOrEdit === 0) {
        this.formData.filePath = []
      }
      if (this.formData.path) {
        this.formData.filePath = this.formData.path.split(',') || []
        this.fileUrlList = this.formData.filePath.map(url => {
          return {
            uuid: getUUID(32),
            name: url.replace('scl/evaluationReport/', ''),
            url: getFilePath(url)
          }
        }) || []
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
            path: this.formData.filePath && this.formData.filePath.length ? this.formData.filePath.join(',') : ''
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

<style scoped>
</style>
