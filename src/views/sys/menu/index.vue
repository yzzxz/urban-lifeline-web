<template>
  <div class="app-container">
    <div class="table-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新 建</el-button>

      <el-button type="primary" icon="el-icon-refresh-left" @click="getList">刷 新</el-button>
    </div>
    <el-table ref="tableWrapper" :key="tableKey" v-loading="tableLoading" :data="tableData" row-key="id"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
              :header-cell-style="$store.state.settings.tableHeaderStyle"
              highlight-current-row border stripe>
      <el-table-column label="名称" prop="name" min-width="120">
        <template slot-scope="scope">
          <span>
            <i :class="'el-icon-'+scope.row.icon" /> {{ scope.row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="链接" prop="uri" min-width="120" />
      <el-table-column label="是否显示" prop="isShow" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.isShow | whetherOrNotFilter }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="权限配置" prop="isShow" min-width="160">
        <template slot-scope="scope">
          <div v-if="scope.row.type=='page'">
          </div>
        </template>
      </el-table-column> -->
      <el-table-column label="备注" prop="remarks" min-width="120" />
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-tooltip effect="dark" content="新增子级" placement="top">
            <el-link :underline="false" type="primary" icon="el-icon-plus" circle @click="handleSubCreate(scope.row)" />
          </el-tooltip>
          <el-tooltip effect="dark" content="编辑" placement="top">
            <el-link :underline="false" type="primary" icon="el-icon-edit" circle @click="handleEdit(scope.row)" />
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top">
            <!--          <el-link :underline="false" type="danger" icon="el-icon-delete" circle @click="handleDelete(scope.row.id)" />-->
            <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">
              <el-link slot="reference" :underline="false" icon="el-icon-delete" type="danger" style="margin:0 1rem" />
            </el-popconfirm>
          </el-tooltip>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty description="暂无数据" />
      </template>
    </el-table>
    <!--  菜单编辑弹窗  -->
    <menu-form-dialog :form-data="formData" :add-or-edit="addOrEdit" :is-show="dialogVisible" @closeDialog="handleCloseDialog"
                      @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>

<script>
import MenuFormDialog from './dialog/menuFormDialog.vue'

import BaseCurd from '@/mixin/BaseCurd'
export default {
  name: 'MenuManage',
  components: { MenuFormDialog },
  mixins: [BaseCurd],
  data() {
    return {
      uri: {
        list: '/api/sys/v1/sys/sysMenu/tree',
        add: '/api/sys/v1/sys/sysMenu/',
        edit: '/api/sys/v1/sys/sysMenu/',
        del: '/api/sys/v1/sys/sysMenu/'
      },
      pageSize: -1,
      pageNum: -1
    }
  },
  mounted() {

  },
  methods: {
    // 新增子级
    handleSubCreate(row) {
      this.formData = {
        parentId: row.id
      }
      this.addOrEdit = 0
      this.dialogVisible = true
    }
  }
}
</script>
<style>
</style>
