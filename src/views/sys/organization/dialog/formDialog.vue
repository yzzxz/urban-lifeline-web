<template>
  <el-dialog :title="addOrEdit===0 ? '新增':'编辑'" width="40rem" append-to-body :visible.sync="isShow"
             :close-on-click-modal="false" :before-close="handleCancel" @open="handleOpenDialog">
    <el-form ref="form" :model="formData" label-width="6rem" :rules="rules">
      <el-form-item label="组织编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入组织编码" clearable maxlength="20" />
      </el-form-item>

      <el-form-item label="组织名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入组织名称" clearable maxlength="20" />
      </el-form-item>

      <el-form-item label="机构类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择机构类型" clearable>
          <el-option label="" value="" />
        </el-select>
      </el-form-item>

      <el-form-item label="上级组织" prop="parentId">
        <org-tree-select v-model="formData.parentId" placeholder="请选择上级组织" clearable />
      </el-form-item>

      <el-form-item label="负责人" prop="primaryPerson">
        <el-input v-model="formData.primaryPerson" placeholder="请输入负责人" clearable maxlength="10" />
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleSave">保 存</el-button>
    </span>
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
        code: [{ required: true, message: '请输入组织编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }],
        primaryPerson: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    // 打开弹窗
    handleOpenDialog() {
      this.$nextTick(() => {
        // 弹窗打开，清除表单校验
        this.$refs['form'].clearValidate()
      })
    },
    // 关闭弹窗
    handleCloseDialog(done) {
      this.$confirm('确认关闭？')
        .then((_) => {
          this.$emit('closeDialog', 0)
        })
        .catch((_) => {})
    },

    handleSave() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const para = { ...this.formData }
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
    // 取消
    handleCancel() {
      this.$emit('closeDialog', 0)
    }
  }
}
</script>

<style scoped lang="scss">
.el-input,
.el-select{
  width: 100%;
}
</style>
