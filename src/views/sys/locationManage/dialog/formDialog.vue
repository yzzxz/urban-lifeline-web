<template>
  <el-dialog :title="addOrEdit | formatTitle" width="52rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="8rem" :model="formData" :rules="rules" inline>
      <el-form-item label="评估单元" prop="evaluationUnitId">
        <el-select v-model="formData.evaluationUnitId" placeholder="请选择" clearable>
          <el-option v-for="item in evaluationUnitList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="道路名称" prop="locationName">
        <el-input v-model="formData.locationName" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="道路编码" prop="locationCode">
        <el-input v-model="formData.locationCode" maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="道路类型" prop="type">
        <!--        <el-select v-model="formData.type" clearable>-->
        <!--          <el-option v-for="item in $store.state.dict.roadTypeList" :key="item.value" :label="item.label" :value="item.value" />-->
        <!--        </el-select>-->
        <dict-select v-model="formData.type" dict-code="SCL_ROAD_TYPE" type="select" clearable />
      </el-form-item>
      <el-form-item label="所在区域" prop="addr">
        <!--        <el-input v-model="formData.addr" placeholder="请输入" maxlength="150" clearable />-->
        <el-select v-model="formData.addr" placeholder="请选择" filterable allow-create clearable>
          <el-option v-for="(item,index) in $store.state.dict.suzhouAddr" :key="index" :value="item" :label="item" />
        </el-select>
      </el-form-item>

      <el-form-item label="长度(m)" prop="extent">
        <el-input v-model="formData.extent" placeholder="请输入" maxlength="20" clearable />
      </el-form-item>

      <el-form-item label="宽度(m)" prop="breadth">
        <el-input v-model="formData.breadth" placeholder="请输入" maxlength="20" clearable />
      </el-form-item>

      <el-form-item label="起始点" prop="point">
        <el-input v-model="formData.point" placeholder="请输入道路起点 - 终点" maxlength="100" clearable />
      </el-form-item>

      <el-form-item label="车道数" prop="laneCount">
        <el-input v-model.number="formData.laneCount" placeholder="请输入" maxlength="10" clearable />
      </el-form-item>

      <el-form-item label="总车道(m)" prop="laneTotalCount">
        <el-input v-model="formData.laneTotalCount" placeholder="请输入" maxlength="10" clearable />
      </el-form-item>

      <el-form-item label="路段类型" prop="checkType">
        <!--        <el-radio-group v-model="formData.checkType">-->
        <!--          <el-radio :label="'0'">非监测设备路段</el-radio>-->
        <!--          <el-radio :label="'1'">监测设备路段</el-radio>-->
        <!--        </el-radio-group>-->

        <dict-select v-model="formData.checkType" type="radio" dict-code="SCL_ROAD_CHECK_TYPE_LIST" />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="formData.remarks" type="textarea" placeholder="请输入" maxlength="200" clearable style="width: 40rem" />
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { validNumberGt0 } from '@/utils/validate'

export default {
  name: 'LocationFormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新增'
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
    },
    evaluationUnitList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      rules: {
        // evaluationUnitId: [
        //   { required: true, message: '请选择评估单元', trigger: 'blur' }
        // ],
        locationName: [
          { required: true, message: '请输入道路名称', trigger: 'blur' }
        ],
        locationCode: [
          { required: true, message: '请输入道路编码', trigger: 'blur' }
        ],
        // addr: [
        //   { required: true, message: '请选择道路所在区域', trigger: 'blur' }
        // ],
        checkType: [
          { required: true, message: '请选择路段类型', trigger: 'blur' }
        ],
        // type: [
        //   { required: true, message: '请选择道路类型', trigger: 'blur' }
        // ],
        extent: [
          { validator: validNumberGt0, trigger: 'blur' }
        ],
        breadth: [
          { validator: validNumberGt0, trigger: 'blur' }
        ],
        laneTotal: [
          { validator: validNumberGt0, trigger: 'blur' }
        ],
        laneTotalCount: [
          { validator: validNumberGt0, trigger: 'blur' }
        ]
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
.el-select {
  width: 100%;
}
</style>
