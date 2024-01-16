<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form">
      <el-form-item label="项目名称">
        <el-input v-model="query.projectName" />
      </el-form-item>

      <el-form-item label="">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表操作按钮 -->
    <div class="table-buttons">

      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
        新增
      </el-button>
      <el-button type="primary" plain icon="el-icon-delete" @click="handleDeleteBatch">
        批量删除
      </el-button>
    </div>
    <!-- 列表 -->
    <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" :reserve-selection="true" align="center" />
      <el-table-column label="序号" width="60" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="projectCode" label="项目编码" min-width="120" />
      <el-table-column prop="projectName" label="项目名称" min-width="120" />
      <el-table-column prop="custom1" label="自定义1" min-width="120" />
      <el-table-column prop="custom2" label="自定义2" min-width="120" />
      <el-table-column prop="custom3" label="自定义3" min-width="120" />

      <el-table-column prop="remarks" label="备注" min-width="120" show-overflow-tooltip />

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template v-slot="scope">
          <el-link type="primary" :underline="false" @click="handleEdit(scope.row)">
            编辑
          </el-link>
          <el-divider direction="vertical" />
          <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">
            <el-link slot="reference" type="primary" :underline="false">
              删除
            </el-link>
          </el-popconfirm>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty :image-size="80" />
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="pagination-box">
      <el-pagination small :current-page.sync="pageNum" :page-sizes="pageSizeList" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                     :total="total" background @size-change="handleChangePageSize" @current-change="handleChangePage" />
    </div>

    <!-- 表单编辑弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" @closeDialog="handleCloseDialog"
                 @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
export default {
  name: 'ProjectManage',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclProject/',
      deleteAllId: 'sclProjectIds'
    }
  },
  activated() {},
  mounted() {},
  methods: {}
}
</script>
<style scoped lang="scss">
</style>
