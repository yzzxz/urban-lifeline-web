<template>
  <el-dialog title="字典维护" width="800px" append-to-body :visible.sync="dialogVisible" :before-close="handleClose"
             @open="handleOpen">
    <el-form ref="form" :model="formData" label-width="100px" inline>
      <el-form-item label="键值">
        <el-input v-model="formData.value" clearable />
      </el-form-item>
      <el-form-item label="标签">
        <el-input v-model="formData.label" clearable />
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model="formData.sort" clearable />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" :loading="btnLoading" @click="handleSubmit">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addDict, editDict } from '@/api/sys/dict'
export default {
  props: {
    formData: {
      type: Object,
      required: true
    },
    dialogVisible: {
      type: Boolean,
      default: false
    },
    // 0-新增；1-编辑
    addOrEdit: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      saveLoading: false,
      rules: {},
      btnLoading: false
    }
  },
  methods: {
    handleOpen() {
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleClose(done) {
      this.$confirm('确认关闭此弹窗吗？')
        .then((_) => {
          done()
        })
        .catch((_) => {})
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const para = { ...this.formData }
          // 新增
          if (this.addOrEdit === 0) {
            addDict(para)
              .then((res) => {
                if (res.code === 1) {
                  this.$emit('closeDialog', 1)
                }
                this.btnLoading = false
              })
              .catch((err) => {
                console.log('err :>> ', err)
                this.btnLoading = false
              })
          } else {
            editDict(para)
              .then((res) => {
                if (res.code === 1) {
                  this.$emit('closeDialog', 1)
                }
                this.btnLoading = false
              })
              .catch((err) => {
                console.log('err :>> ', err)
                this.btnLoading = false
              })
          }
        } else {
          return this.$message.warning('表单校验失败，请检查输入!')
        }
      })
    },
    handleCancel() {
      this.$emit('closeDialog')
    }
  }
}
</script>

<style>
</style>
