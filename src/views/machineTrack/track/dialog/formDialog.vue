<template>
  <el-dialog :title="addOrEdit | formatTitle" width="53rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" class="padding-dialog" @open="handleOpen">
    <el-form ref="form" :model="formData" :rules="rules" label-position="top" inline class="form-top-label">
      <el-form-item label="设备名称" prop="mechanicalName">
        <el-input v-model="formData.mechanicalName" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="设备类型" prop="mechanicalType">
        <el-input v-model="formData.mechanicalType" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="设备型号" prop="deviceModel">
        <el-input v-model="formData.deviceModel" placeholder="请输入" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="进场时间">
        <el-date-picker v-model="formData.approachDate" type="date" value-format="yyyy-MM-dd HH:mm:ss" clearable />
      </el-form-item>

      <el-form-item label="监测设备类型" prop="monitorDeviceType">
        <el-select v-model="formData.monitorDeviceType" clearable>
          <el-option v-for="item in devTypeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="设备编码" prop="deviceNumber">
        <el-input v-model="formData.deviceNumber" placeholder="请输入" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="编号" prop="number">
        <el-input v-model="formData.number" placeholder="请输入" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label="项目名称">
        <el-select v-model="formData.projectId" clearable>
          <el-option v-for="item in $store.state.dict.projectList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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
  name: 'TrackFormDialog',
  components: {},
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新增机械设备'
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
      devTypeList: [
        {
          label: 'GPS定位系统',
          value: 'GPS'
        }
      ],
      rules: {
        mechanicalName: [{ required: true, message: '请输入机械设备名称', trigger: 'blur' }],
        monitorDeviceType: [{ required: true, message: '请选择监测设备类型', trigger: 'blur' }]
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

<style scoped lang="scss">
.form-top-label{
  .el-select,
  .el-input,
  .el-date-editor {
    width: 20rem;

    margin-right: 2rem;
  }
}
</style>
