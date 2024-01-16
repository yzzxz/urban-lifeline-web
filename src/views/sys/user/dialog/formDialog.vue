<template>
  <el-dialog title="用户管理" width="58rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="9rem" inline :model="formData" :rules="rules">
      <el-form-item label="登录名" prop="loginName">
        <el-input v-model="formData.loginName" placeholder="请输入用户名" clearable :disabled="addOrEdit===1" />
      </el-form-item>
      <el-form-item label="所属部门" prop="sysOrganizationId">
        <!--        <el-select v-model="formData.sysOrganizationId" placeholder="请选择所属部门" @change="handleChangeOrg">-->
        <!--          <el-option v-for="item in groupOptionList" :key="item.value" :label="item.label" :value="item.value" />-->
        <!--        </el-select>-->
        <org-tree-select v-model="formData.sysOrganizationId" @change="handleChangeOrg" />
      </el-form-item>
      <el-form-item label="用户角色" prop="roleList">
        <el-select v-model="formData.roleList" placeholder="请选择用户角色" multiple collapse-tags clearable>
          <el-option v-for="item in roleOptionList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" clearable maxlength="10" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="formData.sex" placeholder="请选择性别" clearable>
          <el-option label="男" value="1" />
          <el-option label="女" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" clearable maxlength="11" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" clearable />
      </el-form-item>

      <el-form-item label="是否允许登录" prop="loginFlag">
        <el-select v-model="formData.loginFlag" placeholder="请选择是否允许登录" clearable>
          <el-option label="允许" value="1" />
          <el-option label="不允许" value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" @click="handleCancel">取 消</el-button>
      <el-button size="medium" type="primary" @click="handleSubmit">确 定</el-button>
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
    },
    groupOptionList: {
      type: Array,
      default: function() {
        return []
      }
    },
    roleOptionList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      saveLoading: false,
      rules: {
        loginName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],

        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        sysOrganizationId: [
          { required: true, message: '请选择所属部门', trigger: 'blur' }
        ],
        loginFlag: [
          { required: true, message: '请选择是否允许登录', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    handleChangeOrg(val) {
      const org = this.groupOptionList.find((i) => i.value === val)
      if (org) {
        this.formData.companyName = org.label
      }
    },
    handleOpen() {
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.addOrEdit === 0) {
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
