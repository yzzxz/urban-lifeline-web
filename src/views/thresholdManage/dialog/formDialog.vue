<template>
  <el-dialog :title="addOrEdit | formatTitle" width="40rem" top="6rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" class="padding-dialog" @open="handleOpen">
    <el-form ref="form" label-width="6rem" :model="formData" :rules="rules">
      <el-tabs v-model="activeTab">
        <el-tab-pane v-if="!isEditBatch" name="deviceInfo">
          <template slot="label">设备信息</template>

          <el-form-item label="设备序列号" prop="deviceCode">
            <el-input v-model="formData.deviceCode" maxlength="50" clearable />
          </el-form-item>
          <el-form-item label="监测内容" prop="checkType">
            <el-select v-model="formData.checkType" style="width: 100%">
              <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="设备名称" prop="deviceType">
            <el-select v-model="formData.deviceType" placeholder="请输入" maxlength="20" clearable style="width: 100%">
              <el-option v-for="item in $store.state.dict.deviceTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="测点编号" prop="deviceName">
            <el-input v-model="formData.deviceName" placeholder="请输入" maxlength="20" clearable />
          </el-form-item>

          <el-form-item label="设备位置" prop="projectId">
            <el-select v-model="formData.projectId" style="width: 100%">
              <el-option v-for="item in $store.state.dict.positionList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="采样频率" prop="sampleFrequency">
            <el-input v-model="formData.sampleFrequency" placeholder="请输入" maxlength="3" clearable>
              <template #suffix>HZ</template>
            </el-input>
          </el-form-item>

          <el-form-item label="设备坐标" prop="deviceCoordinates">
            <div style="display:flex">
              <el-input v-model="formData.longitude" placeholder="请输入" disabled>
                <template #suffix>经度</template>
              </el-input>
              <span style="margin: 0 1rem"> - </span>
              <el-input v-model="formData.latitude" placeholder="请输入" disabled>
                <template #suffix>纬度</template>
              </el-input>
            </div>

          </el-form-item>

        </el-tab-pane>

        <el-tab-pane name="warningInfo">
          <template slot="label">预警信息</template>

          <el-form-item label="阈值类型" prop="paramType">
            <el-radio-group v-model="formData.paramType">
              <el-radio label="0">±</el-radio>
              <el-radio label="1">+</el-radio>
              <el-radio label="2">-</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="三级告警">
            <div style="display:flex">
              <el-input v-model="formData.warn3" />
              <span style="margin: 0 1rem"> - </span>
              <el-input v-model="formData.warn2" />
            </div>
          </el-form-item>

          <el-form-item label="二级告警">
            <div style="display:flex">
              <el-input v-model="formData.warn2" />
              <span style="margin: 0 1rem"> - </span>
              <el-input v-model="formData.warn1" />
            </div>
          </el-form-item>

          <el-form-item label="一级告警">
            <div style="display:flex">
              <el-input v-model="formData.warn1" />
              <span style="margin: 0 1rem"> - </span>
              <el-input value="∞" disabled />
            </div>
          </el-form-item>

        </el-tab-pane>

      </el-tabs>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ThresholdFormDialog',
  components: {},
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新建指标'
      } else if (val === 1) {
        return '编辑'
      } else {
        return '查看'
      }
    }
  },
  props: {
    // 是否批量编辑
    isEditBatch: {
      type: Boolean,
      default: false
    },
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
      activeTab: 'deviceInfo',
      rules: {
        param: [{ required: true, message: '请输入', trigger: 'blur' }],
        paramType: [{ required: true, message: '请输入', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleOpen() {
      if (this.isEditBatch) {
        this.activeTab = 'warningInfo'
      }
      if (this.addOrEdit === 0) {
        this.activeTab = 'deviceInfo'
      }
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
          if (this.isEditBatch) {
            this.$emit('editBatch', this.formData)
          } else {
            this.$emit('addFormData', this.formData)
          }
          // if (this.addOrEdit === 0) {
          //   this.$emit('addFormData', this.formData)
          // } else {
          //   this.$emit('editFormData', this.formData)
          // }
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

<style lang="scss">
.padding-dialog {
  .el-dialog__body {
    padding: 10px 50px;
  }
}
.form-top-label {
  .el-form-item .el-form-item__label {
    padding-bottom: 0 !important;
  }
}
</style>
