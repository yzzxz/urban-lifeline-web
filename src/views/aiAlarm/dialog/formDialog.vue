<template>
  <el-dialog :title="addOrEdit===2?'详情':'销项'" width="50rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">

    <div v-if="addOrEdit===2" class="detail-table">
      <el-image class="errImg" :src="imgUrl" :preview-src-list="[imgUrl]">
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline" />
        </div>
      </el-image>

      <el-descriptions style="flex: 1" title="" :column="1" border :label-style="{'text-align':'right','background-color':'#F3F8FC'}">
        <el-descriptions-item label="设备名称">{{ formData.camName }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ formData.projectName }}</el-descriptions-item>
        <el-descriptions-item label="告警类型">
          <el-tag size="small" type="warning">{{ formData.funcIdName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发生时间">
          {{ formData.createDate | dateTimeFilter }}
        </el-descriptions-item>

        <el-descriptions-item label="是否异常">
          <el-tag size="small" :type="formData.abnormalFlag === '1'?'danger':'primary'">
            {{ formData.abnormalFlag | whetherOrNotFilter }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-else-if="addOrEdit===1">
      <el-form ref="form" :model="formData" label-width="7rem" :rules="rules">
        <el-form-item label="设备名称">
          <el-input v-model="formData.camName" disabled />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="formData.projectName" disabled />
        </el-form-item>

        <el-form-item label="告警类型">
          <el-input v-model="formData.funcIdName" disabled />
        </el-form-item>

        <el-form-item label="报警图片">
          <el-image :src="imgUrl" :preview-src-list="[imgUrl]" style="height: 100px">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
        </el-form-item>

        <el-form-item label="是否异常" prop="abnormalFlag">
          <el-radio-group v-model="formData.abnormalFlag">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input v-model="formData.remarks" type="textarea" resize="none" maxlength="100" :rows="2" />
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getToken } from '@/utils/auth'

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
      rules: {
        abnormalFlag: [
          { required: true, message: '请选择是否销项', trigger: 'blur' }
        ],
        remarks: [
          { required: true, message: '请输入销项备注', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    imgUrl() {
      return `/upload/secImage/${this.formData.funcId}/${
        this.formData.bizId
      }.jpg?token=${getToken()}`
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleOpen() {
      this.$nextTick(() => {
        // 弹窗打开，清除表单校验
        this.$refs['form']?.clearValidate()
      })
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
    },

    handleCancel() {
      this.$emit('closeDialog', 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-table {
  display: flex;
  align-items: center;
}

.errImg {
  flex: 1;
  margin-right: 2rem;
  width: 20rem;
}
</style>
