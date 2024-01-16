<template>
  <div class="app-container">

    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form">
      <el-form-item label="检查日期">
        <el-date-picker v-model="query.inspectionDate" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" />
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>
    <div class="table-container">
      <!-- 列表操作按钮 -->
      <div class="table-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          添加任务
        </el-button>
        <!-- <el-button type="danger" icon="el-icon-delete" @click="handleDeleteBatch">
            删除
        </el-button> -->
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
        <el-table-column prop="missionNumber" label="任务编号" min-width="100" />

        <el-table-column prop="missionName" label="任务名称" min-width="200" />
        <el-table-column prop="managementUnit" label="管理单位" min-width="150" />
        <el-table-column prop="supervisingUnit" label="监理单位" min-width="150" />
        <el-table-column prop="inspectionUnit" label="检查单位" min-width="120" />
        <el-table-column prop="inspectionDate" label="检查日期" min-width="100">
          <template v-slot="scope">
            {{ scope.row.inspectionDate | dateFilter }}
          </template>
        </el-table-column>
        <el-table-column prop="inspectionPersonnel" label="检查人员" min-width="100" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleViewDetailList(scope.row)">
              详情
            </el-link>
            <el-divider direction="vertical" />
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
/**
 * 路面路基病害分析
 */
export default {
  name: 'RoadDiseaseTable',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  props: {
    // 类型：LM-路面；LJ-路基
    pavementRoadbedType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      uri: '/api/scl/v1/scl/sclInspectionTasks/',
      deleteAllId: 'sclInspectionTasksIds'
    }
  },
  created() {
    this.query.pavementRoadbedType = this.pavementRoadbedType
  },
  mounted() {},
  methods: {
    handleViewDetailList(row) {
      if (row.pavementRoadbedType === 'LJ') {
        this.$router.push(`/subgradesAnalysis/subgradesDetail?taskId=${row.id}`)
      } else if (row.pavementRoadbedType === 'LM') {
        this.$router.push(`/pavementAnalysis/pavementDetail?taskId=${row.id}`)
      }
    },
    handleCreate() {
      this.formData = {
        pavementRoadbedType: this.pavementRoadbedType
      }
      this.addOrEdit = 0
      this.dialogVisible = true
    }

  }
}
</script>

<style scoped>

</style>
