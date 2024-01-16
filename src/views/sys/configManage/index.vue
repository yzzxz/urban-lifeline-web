<template>
  <div class="app-container">
    <el-form inline :model="query">
      <el-form-item label="名称" label-width="4rem">
        <el-input v-model="query.label" clearable placeholder="请输入配置名称查询" />
      </el-form-item>
      <el-form-item label="英文名称" label-width="6rem">
        <el-input v-model="query.keyName" clearable placeholder="请输入配置英文名称查询" />
      </el-form-item>
      <el-form-item label=" " label-width="15px">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="table-buttons">
      <el-button icon="el-icon-plus" type="primary" @click="handleCreate">新建</el-button>
    </div>
    <el-table ref="tableWrapper" v-loading="tableLoading" border :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column prop="label" label="名称" min-width="150" />
      <el-table-column prop="keyName" label="英文名称" min-width="150" />
      <el-table-column prop="value" label="值" min-width="150" />
      <el-table-column prop="remarks" label="备注" min-width="100" show-overflow-tooltip />
      <el-table-column prop="updateDate" label="操作时间" width="160">
        <template v-slot="scope">
          {{ scope.row.updateDate | dateTimeFilter }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-link :underline="false" icon="el-icon-edit" type="primary" @click="handleEdit(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">
              <el-link slot="reference" :underline="false" icon="el-icon-delete" type="danger" style="margin-left: 1rem" />
            </el-popconfirm>

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

    <FormDialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" @closeDialog="handleCloseDialog"
                @addFormData="addFormData" @editFormData="editFormData" />
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
      query: {
        createByName: ''
      },
      uri: '/api/sys/v1/sys/sysConfig/',
      pageSize: 20
    }
  },
  activated() {},
  mounted() {},
  methods: {}
}
</script>
