<template>
  <el-dialog :title="addOrEdit | formatTitle" width="40rem" top="6rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" class="padding-dialog" @open="handleOpen">
    <el-form ref="form" label-width="6rem" :model="formData" :rules="rules">

      <el-form-item label="检查日期" prop="inspectionDate">
        <el-date-picker v-model="formData.inspectionDate" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" style="width: 100%" />
      </el-form-item>

      <el-form-item label="任务编号" prop="missionNumber">
        <el-input v-model="formData.missionNumber" placeholder="请输入" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="任务名称" prop="missionName">
        <div style="display:flex">
          <el-date-picker v-model="formData.inspectionDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" disabled />
          <span style="margin: 0 1rem"> - </span>
          <el-input v-model="formData.missionName" placeholder="请输入" clearable />
        </div>
      </el-form-item>

      <!--      <el-form-item label="检测路段" prop="inspectionSection">-->
      <!--        <el-input v-model="formData.inspectionSection" placeholder="请输入" clearable />-->
      <!--      </el-form-item>-->
      <el-form-item label="管理单位" prop="managementUnit">
        <el-input v-model="formData.managementUnit" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="监理单位" prop="supervisingUnit">
        <el-input v-model="formData.supervisingUnit" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="检查单位" prop="inspectionUnit">
        <el-input v-model="formData.inspectionUnit" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="检查人员">
        <el-input v-model="formData.inspectionPersonnel" placeholder="请输入" clearable />
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
  name: 'RoadTaskFormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '添加任务'
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
        inspectionDate: [
          { required: true, message: '请选择检查日期', trigger: 'blur' }
        ],
        missionNumber: [
          { required: true, message: '请输入任务编号', trigger: 'blur' }
        ],
        missionName: [{ required: true, message: '请输入', trigger: 'blur' }],
        inspectionSection: [
          { required: true, message: '请选择检测路段', trigger: 'blur' }
        ],
        managementUnit: [
          { required: true, message: '请选择管理单位', trigger: 'blur' }
        ],
        supervisingUnit: [
          { required: true, message: '请选择监理单位', trigger: 'blur' }
        ],
        inspectionUnit: [
          { required: true, message: '请选择检查单位', trigger: 'blur' }
        ]
      },
      options: []
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
            // this.formData.missionName = `${this.formData.data}:${this.formData.text}`
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
//.padding-dialog {
//  .el-dialog__body {
//    padding: 10px 50px;
//  }
//
//  .el-input {
//    width: 30.9rem;
//  }
//
//  .el-select {
//    width: 30.9rem;
//  }
//}
//
//.form-top-label {
//  .el-form-item .el-form-item__label {
//    padding-bottom: 0 !important;
//  }
//}
</style>
