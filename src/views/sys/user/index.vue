<template>
  <div class="app-container">
    <el-form inline :model="query" label-width="100px">
      <el-form-item label="姓 名">
        <el-input v-model="query.name" clearable placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="登录名">
        <el-input v-model="query.loginName" clearable placeholder="请输入登录名" />
      </el-form-item>
      <el-form-item label="所属部门">
        <el-select v-model="query.sysOrganizationId" placeholder="请选择所属部门">
          <el-option v-for="item in groupOptionList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label=" " label-width="15px">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新 建</el-button>

      <el-button type="primary" plain icon="el-icon-delete" @click="handleDeleteBatch">
        批量删除
      </el-button>
    </div>

    <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="姓名" min-width="120" />
      <el-table-column prop="loginName" label="登录名" min-width="120" />
      <el-table-column prop="roleList" label="角色" min-width="120" :formatter="formatRoleName" />
      <el-table-column prop="mobile" label="手机号" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="120" />
      <el-table-column prop="sysOrganizationId" label="归属部门" min-width="120" :formatter="formatOrgName" />
      <el-table-column prop="loginFlag" label="是否允许登录" min-width="120">
        <template v-slot:default="scope">
          <el-tag v-if="scope.row.loginFlag==='1'" size="small">允许</el-tag>
          <el-tag v-else type="warning" size="small">不允许</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="loginDate" label="最后登录时间" min-width="120">
        <template v-slot:default="scope">
          {{ scope.row.loginDate | dateTimeFilter }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-tooltip effect="dark" content="编辑" placement="top">
            <el-link :underline="false" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)" />
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top">
            <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">
              <el-link slot="reference" :underline="false" icon="el-icon-delete" type="danger" style="margin:0 1rem" />
            </el-popconfirm>
          </el-tooltip>
          <el-tooltip effect="dark" content="重置密码" placement="top">
            <el-link :underline="false" type="warning" icon="el-icon-refresh" @click="handleResetPassword(scope.row.id)" />
          </el-tooltip>
          <!--          <el-tooltip effect="dark" content="删除" placement="top">-->
          <!--            <el-link :underline="false" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row.id)" />-->
          <!--          </el-tooltip>-->
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

    <FormDialog :add-or-edit="addOrEdit" :is-show="dialogVisible" :form-data="formData" :group-option-list="groupOptionList"
                :role-option-list="roleOptionList" @closeDialog="handleCloseDialog" @addFormData="addFormData"
                @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'

import FormDialog from './dialog/formDialog.vue'

export default {
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      query: {},
      uri: '/api/sys/v1/sys/sysUser/',

      groupOptionList: [],
      roleOptionList: []
    }
  },
  mounted() {
    this.getGroupList()
    this.getRoleList()
  },
  methods: {
    // 获取组织列表下拉选
    getGroupList() {
      this.groupOptionList = []
      this.$http({
        url: '/api/sys/v1/sys/sysOrganization/dropDown',
        method: 'get'
      }).then((res) => {
        Object.keys(res.data).map((key) => {
          this.groupOptionList.push({
            label: res.data[key],
            value: key
          })
        })
      })
    },
    // 获取角色列表下拉选
    getRoleList() {
      this.roleOptionList = []
      this.$http({
        url: '/api/sys/v1/sys/sysRole/dropDown',
        method: 'get'
      }).then((res) => {
        Object.keys(res.data).map((key) => {
          this.roleOptionList.push({
            label: res.data[key],
            value: key
          })
        })
      })
    },

    formatOrgName(row, col, cellVal) {
      const group = this.groupOptionList.find((i) => i.value === cellVal)
      if (group) {
        return group.label
      }
      return cellVal
    },
    formatRoleName(row, col, cellVal) {
      let str = ''
      if (Array.isArray(cellVal) && cellVal.length > 0) {
        cellVal.map((item) => {
          const role = this.roleOptionList.find((i) => i.value === item)
          if (role) {
            str += role.label + '；'
          }
        })
      }
      return str.substring(0, str.length - 1) || cellVal
    },
    // 重置密码
    handleResetPassword(id) {
      this.$confirm('即将重置该用户的登录密码，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http({
            url: `/api/sys/v1/sys/sysUser/updatePassword`,
            method: 'put',
            data: { id }
          }).then((res) => {
            if (res.code === 1) {
              this.$message.success('密码重置成功!')
              this.getList()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作已取消'
          })
        })
    }
  }
}
</script>
