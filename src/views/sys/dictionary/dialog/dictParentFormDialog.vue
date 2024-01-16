<template>
  <el-dialog title="字典类型维护" width="600px" append-to-body :visible.sync="dialogVisible" :before-close="handleClose" @open="handleOpen">
    <el-form ref="form" label-width="100px" :model="formData" :rules="rules">
      <el-form-item label="类型" prop="type">
        <el-input v-model="formData.type" clearable />

      </el-form-item>
      <!-- <el-form-item>
        <span style="color: rgba(0, 0, 0, 0.45)">字典类型建议使用下划线连接的英文命名方式，如『basic_type』</span>
      </el-form-item> -->

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" rows="3" resize="none" clearable />
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
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    dialogVisible: {
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
      saveLoading: false,
      rules: {
        type: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
        description: [
          { required: true, message: '请输入字典类型描述', trigger: 'blur' }
        ]
      },
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
          if (this.addOrEdit === 0) {
            addDict(para)
              .then((res) => {
                if (res.code === 1) {
                  this.$message.success(res.message)
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
                  this.$message.success(res.message)
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
      this.$emit('closeDialog', 0)
    }
  }
}
</script>
