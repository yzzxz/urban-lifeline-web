<template>
  <el-dialog title="分配权限" width="40rem" append-to-body :visible.sync="isShow" :close-on-click-modal="false" :before-close="handleCancel"
             @open="handleOpen()">

    <div class="tree-container">

      <el-tree ref="tree" :data="treeData" default-expand-all show-checkbox node-key="id" :default-checked-keys="defaultCheckIds"
               :props="defaultProps" />
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { untieTree } from '@/utils/index'
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    roleId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      hasPagination: false,
      defaultCheckIds: [], // 默认选中的节点

      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  mounted() {
    this.getTreeList()
  },
  methods: {
    // 获取菜单的树结构
    getTreeList() {
      this.$http({
        url: '/api/sys/v1/sys/sysMenu/tree',
        method: 'get'
      })
        .then((res) => {
          if (res.code === 1) {
            this.treeData = res.data
          }
        })
        .catch((err) => {
          console.log('err :>> ', err)
        })
    },
    // 根据角色获取权限列表
    getMenuListByRoleId() {
      this.$http({
        url: `/api/sys/v1/sys/sysRoleMenu/getByRoleId/${this.roleId}`,
        method: 'get'
      })
        .then((res) => {
          if (res.code === 1) {
            const arr = untieTree(res.data)
            this.defaultCheckIds = arr.map((item) => {
              return item.id
            })
          }
        })
        .catch((err) => {
          console.log('err :>> ', err)
        })
    },

    handleOpen() {
      this.getMenuListByRoleId()
    },

    handleCancel() {
      this.$emit('closeDialog', 0)
    },
    handleConfirm() {
      const ids = this.$refs.tree.getCheckedKeys()
      this.$http({
        url: `/api/sys/v1/sys/sysRoleMenu/putByRoleId/?roleId=${this.roleId}`,
        method: 'put',
        data: ids
      }).then((res) => {
        if (res.code === 1) {
          this.$message.success(res.message)

          this.$emit('closeDialog', 1)
        } else {
          this.$message.success(res.message)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.tree-container{
  max-height: 500px;
  overflow-y: scroll;
}
</style>
