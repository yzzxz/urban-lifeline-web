<template>
  <el-dialog :title="addOrEdit | formatTitle" width="40rem" top="6rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="6rem" :model="formData" :rules="rules">

      <el-form-item label="检查日期" prop="inspectionDate">
        <el-date-picker v-model="formData.inspectionDate" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" />
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

      <el-form-item label="任务类型" prop="pavementRoadbedType">
        <el-select v-model="formData.pavementRoadbedType">
          <el-option label="路面巡检" value="LM" />
          <el-option label="路基巡检" value="LJ" />
        </el-select>
      </el-form-item>

      <!--      <el-form-item label="检测路段" prop="inspectionSection">-->
      <!--        <el-input v-model="formData.inspectionSection" placeholder="请选择">-->
      <!--          &lt;!&ndash; <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" /> &ndash;&gt;-->
      <!--        </el-input>-->
      <!--      </el-form-item>-->
      <el-form-item label="管理单位" prop="managementUnit">
        <el-input v-model="formData.managementUnit" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="监理单位" prop="supervisingUnit">
        <el-input v-model="formData.supervisingUnit" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="检查单位" prop="inspectionUnit">
        <el-input v-model="formData.inspectionUnit" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="检查人员">
        <el-input v-model="formData.inspectionPersonnel" placeholder="请输入" />
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
        pavementRoadbedType: [
          { required: true, message: '请选择任务类型', trigger: 'blur' }
        ],
        inspectionDate: [
          { required: true, message: '请选择检查日期', trigger: 'blur' }
        ],
        missionNumber: [
          { required: true, message: '请输入任务编号', trigger: 'blur' }
        ],
        missionName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ],
        inspectionSection: [
          { required: true, message: '请输入检测路段', trigger: 'blur' }
        ]
        // managementUnit: [
        //   { required: true, message: '请选择管理单位', trigger: 'blur' }
        // ],
        // supervisingUnit: [
        //   { required: true, message: '请选择监理单位', trigger: 'blur' }
        // ],
        // inspectionUnit: [
        //   { required: true, message: '请选择检查单位', trigger: 'blur' }
        // ]
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
          const para = { ...this.formData }
          // para.pavementRoadbedType = 'LM'
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
.el-input,
.el-select,
.el-date-editor{
  width: 100%;
}
</style>
