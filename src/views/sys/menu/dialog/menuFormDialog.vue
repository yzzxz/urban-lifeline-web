<template>
  <el-dialog title="菜单信息维护" width="860px" :visible.sync="isShow" :close-on-click-modal="false"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="120px" :model="formData" :inline="true" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择菜单类型">
          <el-option label="权限" value="apiGate" />
          <el-option label="页面" value="page" />
          <el-option label="文件夹" value="directory" />
        </el-select>
      </el-form-item>
      <el-form-item label="上级菜单">
        <tree-select v-model="formData.parentId" placeholder="请选择上级菜单" dropdown-url="/api/sys/v1/sys/sysMenu/tree"
                     :tree-default-props="{ children: 'children',label: 'name'}" />
      </el-form-item>
      <el-form-item label="路由地址href" prop="uri">
        <el-input v-model="formData.uri" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input v-model.number="formData.sort" />
      </el-form-item>
      <el-form-item label="是否显示" prop="isShow">
        <el-select v-model="formData.isShow" placeholder="请选择是否显示">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="图标">
        <div>
          <el-select slot="prepend" v-model="formData.icon" placeholder="请选择" style="width:220px">
            <el-option v-for="icon in iconList" :key="icon.value" :value="icon.value">
              <i :class="'el-icon-'+icon.value"> {{ icon.label }}</i>
            </el-option>
          </el-select>
          <span style="margin-left:6px"><i :class="'el-icon-'+formData.icon" /></span>
        </div>
      </el-form-item>
      <el-row>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" resize="none" rows="3" maxlength="200" />
        </el-form-item>
      </el-row>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

export default {
  props: {
    // 0-新增；1-编辑
    addOrEdit: {
      type: Number,
      default: 0
    },
    isShow: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      require: true,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      menuList: [],
      iconList: [
        {
          label: 'user-solid',
          value: 'user-solid'
        },
        {
          label: 'user',
          value: 'user'
        },
        {
          label: 'coordinate',
          value: 'coordinate'
        },
        {
          label: 'monitor',
          value: 'monitor'
        },
        {
          label: 'document',
          value: 'document'
        },
        {
          label: 'setting',
          value: 'setting'
        },
        {
          label: 'more',
          value: 'more'
        },
        {
          label: 'more-outline',
          value: 'more-outline'
        },
        {
          label: 'star-on',
          value: 'star-on'
        },
        {
          label: 'star-off',
          value: 'star-off'
        },
        {
          label: 's-tools',
          value: 's-tools'
        },
        {
          label: 's-order',
          value: 's-order'
        },
        {
          label: 's-cooperation',
          value: 's-cooperation'
        },
        {
          label: 's-help',
          value: 's-help'
        },
        {
          label: 's-home',
          value: 's-home'
        },
        {
          label: 's-operation',
          value: 's-operation'
        },
        {
          label: 's-platform',
          value: 's-platform'
        },
        {
          label: 's-management',
          value: 's-management'
        },
        {
          label: 's-flag',
          value: 's-flag'
        },
        {
          label: 's-opportunity',
          value: 's-opportunity'
        },
        {
          label: 's-marketing',
          value: 's-marketing'
        },
        {
          label: 's-comment',
          value: 's-comment'
        },
        {
          label: 'notebook-1',
          value: 'notebook-1'
        },
        {
          label: 'notebook-2',
          value: 'notebook-2'
        },
        {
          label: 's-claim',
          value: 's-claim'
        },
        {
          label: 'coin',
          value: 'coin'
        },
        {
          label: 's-promotion',
          value: 's-promotion'
        },
        {
          label: 's-shop',
          value: 's-shop'
        },
        {
          label: 's-data',
          value: 's-data'
        },
        {
          label: 's-check',
          value: 's-check'
        },
        {
          label: 's-grid',
          value: 's-grid'
        },
        {
          label: 'menu',
          value: 'menu'
        },
        {
          label: 'share',
          value: 'share'
        },
        {
          label: 'office-building',
          value: 'office-building'
        },
        {
          label: 'house',
          value: 'house'
        },
        {
          label: 'set-up',
          value: 'set-up'
        },
        {
          label: 'guide',
          value: 'guide'
        },
        {
          label: 'date',
          value: 'date'
        },
        {
          label: 'time',
          value: 'time'
        },
        {
          label: 'finished',
          value: 'finished'
        },
        {
          label: 'help',
          value: 'help'
        },
        {
          label: 'link',
          value: 'link'
        },
        {
          label: 'connection',
          value: 'connection'
        },
        {
          label: 'switch-button',
          value: 'switch-button'
        },
        {
          label: 'truck',
          value: 'truck'
        },
        {
          label: 'alarm-clock',
          value: 'alarm-clock'
        },
        {
          label: 'watch',
          value: 'watch'
        },
        {
          label: 'timer',
          value: 'timer'
        },
        {
          label: 'discover',
          value: 'discover'
        },
        {
          label: 'place',
          value: 'place'
        },
        {
          label: 'location',
          value: 'location'
        },
        {
          label: 'location-outline',
          value: 'location-outline'
        },
        {
          label: 'location-information',
          value: 'location-information'
        },
        {
          label: 'map-location',
          value: 'map-location'
        },
        {
          label: 'service',
          value: 'service'
        },
        {
          label: 'key',
          value: 'key'
        },
        {
          label: 'lock',
          value: 'lock'
        },
        {
          label: 'unlock',
          value: 'unlock'
        }
      ],
      rules: {
        name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择菜单类型', trigger: 'blur' }],
        uri: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
        sort: [{ required: true, message: '请输入菜单排序', trigger: 'blur' }],
        isShow: [
          { required: true, message: '请选择菜单是否显示', trigger: 'blur' }
        ]
      }
    }
  },
  created() {

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
            message: '表单校验失败，请检查输入!'
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-input,
.el-textarea,
.el-select {
  width: 240px;
}

.el-textarea {
  width: 610px;
}
</style>
