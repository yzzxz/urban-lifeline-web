<template>
  <el-dialog top="100px" title="配置管理" width="780px" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleClose" @open="handleOpen">
    <el-form ref="form" label-width="120px" :model="formData" :rules="rules">

      <el-form-item label="名称" prop="label">
        <el-input v-model="formData.label" placeholder="请输入" clearable />
      </el-form-item>

      <el-form-item label="英文名" prop="keyName">
        <el-input v-model="formData.keyName" placeholder="请输入" clearable :disabled="addOrEdit==1">
          <template v-if="addOrEdit!=1" slot="prepend">CONF_</template>
        </el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" style="width: 100%" placeholder="请选择" @change="onChange">
          <el-option label="输入框" value="INPUT" />
          <el-option label="选择器" value="SELECT" />
        </el-select>
      </el-form-item>
      <el-form-item label="值" prop="value">
        <el-input v-if="formData.type=='INPUT'" v-model="formData.value" placeholder="请输入" clearable />
        <el-select v-else v-model="formData.value" style="width: 100%" placeholder="请选择" clearable>
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="formData.remarks" type="textarea" rows="5" placeholder="请输入" clearable />
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
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
      saveLoading: false,
      rules: {
        label: [
          { required: true, message: '请输入名称', trigger: 'blur' } // 此处为用户输入不规则时的提示
        ],
        keyName: [
          { required: true, message: '请输入英文名称', trigger: 'blur' }
        ],
        value: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'blur' }]
      }
    }
  },
  created() {},
  methods: {
    onChange(val) {
      this.formData.value = ''
      this.formData.type = val
    },
    handleOpen() {
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleClose(done) {
      this.$confirm('确认关闭此弹窗吗？')
        .then((_) => {
          done()
          this.$emit('closeDialog', 1)
        })
        .catch((_) => {})
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.addOrEdit === 0) {
            this.formData.keyName = 'CONF_' + this.formData.keyName
            this.$emit('addFormData', this.formData)
          } else {
            this.$emit('editFormData', this.formData)
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

<style>
</style>
