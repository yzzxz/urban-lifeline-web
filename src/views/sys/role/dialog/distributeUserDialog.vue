<template>
  <el-dialog title="分配用户" width="70rem" :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form inline :model="query">
      <el-form-item label="姓名">
        <el-input v-model="query.name" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="query.loginName" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label=" " label-width="10px">
        <el-button type="primary" @click="handleQuery">查 询</el-button>
        <el-button @click="handleResetQuery">重 置</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="multipleTable" :key="tableKey" v-loading="tableLoading" border :data="tableData" :max-height="420"
              :reserve-selection="true" :row-key="getRowKeys"
              :header-cell-style="$store.state.settings.tableHeaderStyle" @select="handleSelect"
              @select-all="handleSelectAll">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="姓名" min-width="120" />
      <el-table-column prop="loginName" label="登录名" min-width="120" />
      <el-table-column prop="mobile" label="手机号" min-width="120" />
      <el-table-column prop="companyName" label="组织名称" min-width="120" />
      <el-table-column prop="loginFlag" label="是否允许登录" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.loginFlag | whetherOrNotFilter }}
        </template>
      </el-table-column>

      <template slot="empty">
        <el-empty description="暂无数据" />
      </template>
    </el-table>
    <div class="pagination-box">
      <el-pagination small :current-page.sync="currentPage" :page-sizes="[ 10, 20, 25, 50]" :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleSizeChange"
                     @current-change="handleCurrentChange" />
    </div>
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
    roleId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      query: {},

      tableLoading: false,
      tableData: [],

      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,

      tableKey: 1,

      multipleSelection: []
    }
  },

  created() {
    this.getList()
  },
  methods: {
    handleQuery() {
      this.currentPage = 1
      this.getList()
    },
    handleResetQuery() {
      for (const key in this.query) {
        if (Object.hasOwnProperty.call(this.query, key)) {
          this.query[key] = ''
        }
      }
      this.handleQuery()
    },
    getRowKeys(row) {
      return row.id
    },
    // 全选按钮同步选中信息
    handleSelectAll(selection) {
      this.list.map((row) => {
        const index = this.multipleSelection.findIndex((e) => e === row.id)
        // 全选，将选项加入 multipleSelection
        if (selection.length && index === -1) {
          this.multipleSelection.push(row.id)
        }
        // 取消全选，将选项从 multipleSelection 中移除
        if (!selection.length && index > -1) {
          this.multipleSelection.splice(index, 1)
        }
      })
    },

    // 单行选中按钮同步选中信息
    handleSelect(selection, row) {
      // 同步选中的数据到 multipleSelection
      const index = this.multipleSelection.findIndex((e) => e === row.id)
      // 当 multipleSelection 有 row，则说明本次操作是取消勾选，进而删除
      if (index > -1) {
        this.multipleSelection.splice(index, 1)
      } else {
        this.multipleSelection.push(row.id)
      }
    },

    // 选中信息回显到页面中
    toggleSelection(selection, list) {
      if (!selection.length || !list.length) return
      // 随机 key，刷新 el-table
      this.tableKey = Math.random()
      list.map((item) => {
        const index = selection.findIndex((e) => {
          return e === item.id
        })
        if (index > -1) {
          this.$nextTick(() => {
            this.$refs.multipleTable.toggleRowSelection(item)
          })
        }
      })
    },

    // 获取人员列表
    getList() {
      this.tableLoading = true
      let params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize
      }
      params = Object.assign(params, this.query)

      this.$http({
        url: '/api/sys/v1/sys/sysUser/',
        method: 'get',
        params
      })
        .then((res) => {
          if (res.code === 1) {
            this.tableData = res.data.dataList
            this.total = res.data.total

            this.toggleSelection(this.multipleSelection, this.tableData)
          }
          this.tableLoading = false
        })
        .catch((err) => {
          console.log('err :>> ', err)
          this.tableLoading = false
        })
    },

    // 获取角色绑定的用户列表
    getSelectedUserList() {
      this.$http({
        url: `/api/sys/v1/sys/sysUserRole/getByRoleId/${this.roleId}`,
        method: 'get'
      }).then((res) => {
        if (res.code === 1) {
          this.$set(this, 'multipleSelection', Object.keys(res.data))

          this.toggleSelection(this.multipleSelection, this.tableData)
        }
      })
    },

    // 点击提交，将选择的用户添加到角色中
    handleConfirm() {
      this.$http({
        url: '/api/sys/v1/sys/sysUserRole/putByRoleId?roleId=' + this.roleId,
        method: 'put',
        data: this.multipleSelection
      }).then((res) => {
        if (res.code === 1) {
          this.$message.success(res.message)
          this.$emit('closeDialog', 1)
        }
      })
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    handleOpen() {
      this.$nextTick(() => {
        this.getSelectedUserList()
      })
    },

    handleCancel() {
      this.$set(this, 'multipleSelection', [])
      this.$emit('closeDialog', 0)
    }
  }
}
</script>
