<template>
  <el-dialog :title="addOrEdit | formatTitle" width="40rem" append-to-body :close-on-click-modal="false"
             :visible.sync="isShow" :before-close="handleCancel" class="padding-dialog" @open="handleOpen">
    <el-form ref="form" label-width="8rem" :model="formData" :rules="rules">
      <el-form-item label="报告名称" prop="name">
        <el-input v-model="formData.name" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="报告类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择" @change="getDayList">
          <el-option label="路面巡检" value="LM" />
          <el-option label="路基巡检" value="LJ" />
        </el-select>
      </el-form-item>

      <el-form-item label="巡查日期" prop="taskDate">
        <el-date-picker ref="task-date" v-model="formData.taskDate" type="date" placeholder="选择日期（仅支持选择有道路巡检任务的日期）"
                        :picker-options="pickerOptions" value-format="yyyy-MM-dd" popper-class="picker-popper" @focus="addMonthChangeEvent" />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="formData.remarks" maxlength="200" clearable type="textarea" />
      </el-form-item>

      <!--      <el-form-item label="选择模板" prop="custom3">-->
      <!--        <el-radio-group v-model="formData.custom3">-->
      <!--          <el-radio :label="1">模板1</el-radio>-->
      <!--          <el-radio :label="2">模板2</el-radio>-->
      <!--          <el-radio :label="3">模板3</el-radio>-->
      <!--          <el-radio :label="4">模板4</el-radio>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'TestFormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新建报告'
      } else if (val === 1) {
        return '修改报告'
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
    const that = this
    return {
      rules: {
        name: [{ required: true, message: '请输入报告名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择报告类型', trigger: 'blur' }],
        taskDate: [{ required: true, message: '请选择巡检日期', trigger: 'blur' }]
      },
      // 要添加红点标记的日期（有巡检任务）
      badgeDate: [],
      pickerOptions: {
        cellClassName: (time) => {
          if (that.badgeDate.includes(parseTime(time, '{y}-{m}-{d}'))) {
            return 'badge'
          }
        },

        disabledDate(time) {
          // 只允许选择有巡检任务的日期
          return that.badgeDate.indexOf(parseTime(time, '{y}-{m}-{d}')) === -1

          // return time.getTime() > Date.now()
        }
      },
      setClick: false
    }
  },
  // watch: {
  //   'formData.taskDate': {
  //     handler(newVal, objVal) {
  //       if (newVal) {
  //         console.log(newVal)
  //         // this.currentDate = newVal
  //       }
  //     }
  //   }
  // },
  methods: {
    // 日期选择器添加改变日期事件
    addMonthChangeEvent() {
      this.getDayList()
      this.$nextTick(() => {
        if (this.setClick) return
        document.querySelectorAll('.el-picker-panel__icon-btn')
          .forEach(item => item.addEventListener('click', () => {
            this.getDayList()
          }))
        this.setClick = true
      })
    },

    // 获取巡检任务日期
    getDayList() {
      // console.log('月份改变', this.$refs['task-date'].picker.date)
      const month = this.$dayjs(this.$refs['task-date']?.picker?.date).format('YYYY-MM')
      if (!this.formData.type) {
        return
      }
      this.$http({
        url: '/api/scl/v1/scl/sclInspectionTasks/getDayCount',
        method: 'get',
        params: {
          month: month || this.$dayjs().format('YYYY-MM'), // 月份
          pavementRoadbedType: this.formData.type // 巡检任务类型
        }
      }).then(res => {
        if (res?.code === 1) {
          if (res.code === 1 && res.data) {
            this.badgeDate = Object.keys(res.data)
          }
        }
      })
    },

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
.padding-dialog {
  .el-dialog__body {
    padding: 10px 50px;
  }

  .el-input {
    width: 25rem;
  }

  .el-select {
    width: 25rem;
  }
}
</style>

<style lang="scss">
.picker-popper .el-date-table .badge::after {
  position: absolute;
  content: "";
  bottom: 0;
  left: 50%;
  width: 8px;
  height: 8px;
  border: 1px solid #FFFFFF;
  border-radius: 50%;
  background-color: #F56C6C;
  transform: translateX(-50%);
}
</style>
