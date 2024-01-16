<template>
  <div class="app-container">
    <el-form inline>
      <el-form-item label="名称">
        <el-input v-model="query.name" clearable placeholder="请输入角色名称模糊查询" />
      </el-form-item>
      <el-form-item label="英文名称" label-width="100px">
        <el-input v-model="query.enname" clearable placeholder="请输入角色英文名称模糊查询(可忽略大小写)" />
      </el-form-item>
      <el-form-item label=" " label-width="15px">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新 建</el-button>
    </div>

    <el-table ref="tableWrapper" v-loading="tableLoading" border default-expand-all :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle" row-key="id"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column prop="enname" label="英文名称" min-width="120" />
      <el-table-column prop="mobile" label="数据范围" min-width="120" />
      <el-table-column prop="email" label="备注" min-width="150" />
      <el-table-column prop="updateBy" label="更改人" min-width="120" />
      <el-table-column prop="updateDate" label="更改时间" min-width="170">
        <template slot-scope="scope">
          {{ scope.row.updateDate | dateTimeFilter }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template v-slot:default="scope">
          <el-tooltip content="编辑" placement="top">
            <el-link :underline="false" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <!--            <el-link :underline="false" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row.id)" />-->
            <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">
              <el-link slot="reference" :underline="false" icon="el-icon-delete" type="danger" style="margin:0 1rem" />
            </el-popconfirm>
          </el-tooltip>
          <el-tooltip content="分配权限" placement="top">
            <el-link type="primary" icon="el-icon-menu" :underline="false" @click="handlePermission(scope.row.id)" />
          </el-tooltip>
          <el-tooltip content="分配用户" placement="top">
            <el-link type="primary" icon="el-icon-user" :underline="false" @click="handleDistributeUser(scope.row.id)" />
          </el-tooltip>

        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty description="暂无数据" />
      </template>
    </el-table>
    <div class="pagination-box">
      <el-pagination small :current-page.sync="pageNum" :page-sizes="[10, 20, 25, 50]" :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleChangePageSize"
                     @current-change="handleChangePage" />
    </div>

    <!-- 角色信息编辑 -->
    <RoleFormDialog :is-show="dialogVisible" :form-data="formData" :add-or-edit="addOrEdit" @closeDialog="handleCloseDialog"
                    @addFormData="addFormData" @editFormData="editFormData" />

    <!-- 分配权限 -->
    <DistributeLimitDialog :is-show="limitDialogVisible" :role-id="roleId" @closeDialog="handleCloseDialog" />

    <!-- 分配用户 -->
    <DistributeUserDialog :is-show="userDialogVisible" :role-id="roleId" @closeDialog="handleCloseDialog" />
  </div>
</template>

<script>
import BaseCurd from '@/mixin/BaseCurd'
import RoleFormDialog from './dialog/roleFormDialog.vue'
import DistributeLimitDialog from './dialog/distributeLimitDialog.vue'
import DistributeUserDialog from './dialog/distributeUserDialog.vue'
export default {
  components: {
    RoleFormDialog,
    DistributeLimitDialog,
    DistributeUserDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      query: {},

      uri: '/api/sys/v1/sys/sysRole/',

      // 编辑状态: true - 可编辑；false - 不可编辑
      editStatus: false,

      // 分页
      pageNum: 1,
      pageSize: 10,
      total: 0,

      tableLoading: false,
      // 表格数据 树结构
      tableData: [],

      dialogVisible: false,
      formData: {},
      addOrEdit: 0,

      limitDialogVisible: false,

      roleId: '',

      userDialogVisible: false
    }
  },
  methods: {
    handleCloseDialog(refresh) {
      if (refresh === 1) {
        this.getList()
      }
      this.dialogVisible = false
      this.limitDialogVisible = false
      this.userDialogVisible = false
    },

    // 权限分配
    handlePermission(id) {
      // this.formData = { ...row }
      this.roleId = id
      this.limitDialogVisible = true
      // this.dialogVisible = false
    },
    // 用户分配
    handleDistributeUser(id) {
      this.roleId = id
      this.userDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
