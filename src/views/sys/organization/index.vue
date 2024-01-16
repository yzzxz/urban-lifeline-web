<template>
  <div class="app-container">
    <div class="table-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新 建</el-button>
    </div>
    <el-table ref="tableWrapper" v-loading="tableLoading" :data="tableData" row-key="id"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}" :header-cell-style="$store.state.settings.tableHeaderStyle"
              highlight-current-row border>
      <el-table-column label="序号" width="55">
        <template slot-scope="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="组织编码" prop="code" min-width="120" />
      <el-table-column label="组织名称" prop="name" min-width="120" />
      <el-table-column label="负责人" prop="primaryPerson" min-width="120" />
      <el-table-column label="备注" prop="remarks" min-width="120" />
      <el-table-column label="操作" width="120">
        <template v-slot:default="scope">

          <el-link :underline="false" type="primary" icon="el-icon-plus" @click="handleSubCreate(scope.row)" />
          <el-link :underline="false" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)" />
          <!--          <el-link :underline="false" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)" />-->
          <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">
            <el-link slot="reference" :underline="false" icon="el-icon-delete" type="danger" style="margin-left: 1rem" />
          </el-popconfirm>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty description="暂无数据" />
      </template>
    </el-table>
    <el-pagination small class="pagination-box" layout="total, sizes, prev, pager, next, jumper" :total="total" :current-page.sync="pageNum"
                   :page-size.sync="pageSize" :page-sizes="[5, 10, 20, 30, 50, 100]" @size-change="handleChangePageSize"
                   @current-change="handleChangePage" />

    <FormDialog :add-or-edit="addOrEdit" :form-data="formData" :is-show="dialogVisible" @closeDialog="handleCloseDialog"
                @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>

<script>
import FormDialog from './dialog/formDialog.vue'

import BaseCurd from '@/mixin/BaseCurd'

export default {
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/sys/v1/sys/sysOrganization/'
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    // 子级新增
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
