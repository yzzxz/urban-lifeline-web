<template>
  <el-dialog :title="addOrEdit | formatTitle" width="45rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-descriptions class="margin-top" title="" :column="1" border>
      <!-- <template slot="extra">
        <el-button type="primary" size="small">操作</el-button>
      </template> -->
      <el-descriptions-item label="预警类型">
        {{ formatDevType(formData.devType) }}
      </el-descriptions-item>

      <el-descriptions-item label="预警等级">
        <span class="dot" :class="'warn'+formData.warnLevel" />{{ formData.warnLevel | warningLevelFilter }}
      </el-descriptions-item>

      <el-descriptions-item label="预警位置">
        {{ formatPosition(formData.locationId) }}
      </el-descriptions-item>

      <el-descriptions-item label="预警时间">
        {{ formData.createDate | dateTimeFilter }}
      </el-descriptions-item>

      <el-descriptions-item label="处置建议">
        <div v-if="formData.warnLevel===3">
          1、地下检测单位：探地雷达检测 <br>
          2、道路养护单位：日常巡检巡查重点关注
        </div>

        <div v-else-if="formData.warnLevel===2">
          1、地下检测单位：探地雷达加密检测<br>
          2、道路养护单位：制定计划进行消除
        </div>

        <div v-else-if="formData.warnLevel===1">
          1、园区综合行政执法局，启动应急联动预案<br>
          2、交管单位：交通管制、警示隔离、应急疏散<br>
          3、地下管线权属单位：排查及抢修<br>
          4、道路养护单位：现场排查及抢修
        </div>
      </el-descriptions-item>

    </el-descriptions>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleCancel">确 定</el-button>
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
      } else if (val === 0) {
        return '编辑'
      } else {
        return '详情'
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
      rules: {}
    }
  },
  methods: {
    formatPosition(val) {
      return (
        this.$store.state.dict.positionList.find((i) => i.value === val)
          ?.label || val
      )
    },

    formatDevType(val) {
      return (
        this.$store.state.dict.monitoringItemList.find((i) => i.value === val)
          ?.label || val
      )
    },
    handleOpen() {
      this.$nextTick(() => {
        // 弹窗打开，清除表单校验
        this.$refs['form']?.clearValidate()
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    },
    // 保存或新增
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
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;

  &.warn1 {
    background-color: #eb595c;
  }
  &.warn2 {
    background-color: #f08d50;
  }
  &.warn3 {
    background-color: #f0d550;
  }
}
</style>
