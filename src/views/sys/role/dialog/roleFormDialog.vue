<template>
  <el-dialog title="角色信息维护" width="780px" :visible.sync="isShow" :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="150px" :model="formData" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="英文名称" prop="enname">
        <el-input v-model="formData.enname" />
      </el-form-item>
      <el-form-item label="数据范围" prop="dataScope">
        <el-select v-model="formData.dataScope " placeholder="请选择数据范围">
          <el-option label="所有数据" :value="0" />
          <el-option label="所在公司/部门及以下数据" :value="1" />
          <el-option label="所在公司/部门数据" :value="2" />
          <el-option label="仅本人数据" :value="8" />
          <el-option label="按明细设置" :value="9" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remarks" type="textarea" resize="none" rows="3" maxlength="200" />
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    // 0-新增；1-编辑
    addOrEdit: {
      type: Number,
      default: 0
    },
    isShow: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      require: true,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      rules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        enname: [
          { required: true, message: '请输入角色英文名称', trigger: 'blur' }
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
            message: '表单校验失败，请检查输入!'
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-input,
.el-textarea,
.el-select {
  width: 500px;
}
</style>
