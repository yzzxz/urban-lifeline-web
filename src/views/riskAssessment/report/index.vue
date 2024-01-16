<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline label-width="6rem" class="query-form">
      <el-form-item label="报告名称">
        <el-input v-model="query.name" maxlength="50" clearable />
      </el-form-item>

      <el-form-item label=" " label-width="2rem">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-container">
      <!-- 列表操作按钮 -->
      <div class="table-buttons">
        <el-button type="primary" icon="el-icon-upload" @click="handleCreate">
          上传
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
        <el-table-column prop="name" label="报告名称" min-width="120" />

        <el-table-column prop="reportDate" label="生成日期" min-width="120">
          <template v-slot="scope">
            {{ scope.row.reportDate | dateFilter }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleView(scope.row)">
              查看
            </el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" :underline="false" @click="handleDownload(scope.row.path)">
              下载
            </el-link>
            <el-divider direction="vertical" />
            <!--            <el-link type="primary" :underline="false" @click="handleEdit(scope.row)">-->
            <!--              编辑-->
            <!--            </el-link>-->
            <!--            <el-divider direction="vertical" />-->
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
        <el-pagination small :current-page.sync="pageNum" :page-sizes="pageSizeList" :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleChangePageSize"
                       @current-change="handleChangePage" />
      </div>
    </div>
    <!-- 表单编辑弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" @closeDialog="handleCloseDialog"
                 @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
import { getToken } from '@/utils/auth'
export default {
  name: 'RiskAssessmentReport',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclOutcomeReport/',
      deleteAllId: 'sclOutcomeReportIds'
    }
  },
  activated() {},
  mounted() {},
  methods: {
    handleDownload(url) {
      window.open(url + '?token=' + getToken(), '_blank')
    }
  }
}
</script>
<style scoped lang="scss">

</style>
