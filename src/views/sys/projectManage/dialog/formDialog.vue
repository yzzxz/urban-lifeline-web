<template>
  <el-dialog :title="addOrEdit | formatTitle" width="50rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="8rem" :model="formData" :rules="rules">
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="formData.projectName" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="项目编码" prop="projectCode">
        <el-input v-model="formData.projectCode" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="自定义字段1" prop="custom1">
        <el-input v-model="formData.custom1" placeholder="请输入" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="自定义字段2" prop="custom2">
        <el-input v-model="formData.custom2" placeholder="请输入" maxlength="20" clearable />
      </el-form-item>
      <el-form-item label="自定义字段3" prop="custom3">
        <el-input v-model="formData.custom3" placeholder="请输入" maxlength="20" clearable />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="formData.remarks" placeholder="请输入" maxlength="20" clearable />
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
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
      rules: {
        projectName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        projectCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' }
        ]
      }
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
    // 保存或新增项目节点
    handleConfirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.addOrEdit === 0) {
            this.$emit('addFormData', this.formData)
          } else {
            this.$emit('editFormData', this.formData)
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
