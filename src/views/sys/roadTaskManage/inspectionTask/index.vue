<template>
  <div class="app-container">

    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form" label-width="6rem">
      <el-form-item label="任务名称">
        <el-input v-model="query.missionName" clearable />
      </el-form-item>
      <el-form-item label="任务编号">
        <el-input v-model="query.missionNumber" clearable />
      </el-form-item>

      <el-form-item label=" " label-width="2rem">
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
        <el-table-column prop="missionNumber" label="任务编号" min-width="120" />

        <el-table-column prop="missionName" label="任务名称" min-width="120" />
        <el-table-column prop="managementUnit" label="管理单位" min-width="120" />
        <el-table-column prop="supervisingUnit" label="监理单位" min-width="120" />
        <el-table-column prop="inspectionUnit" label="检查单位" min-width="120" />
        <el-table-column prop="inspectionDate" label="检查日期" min-width="120" />
        <el-table-column prop="inspectionPersonnel" label="检查人员" min-width="120" />
        <el-table-column prop="pavementRoadbedType" label="任务类型" min-width="100">
          <template v-slot="scope">
            {{ scope.row.pavementRoadbedType === 'LM'? '路面巡检' : '路基巡检' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template v-slot="scope">
            <!-- <el-link type="primary" :underline="false">
              <router-link to="/sys/roadbedAnalysis">路基病害详情</router-link>
            </el-link>
            <el-divider direction="vertical" /> -->
            <el-link type="primary" :underline="false" @click="handlePageJump(scope.row)">
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
export default {
  name: 'InspectionTask',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      // curdMountedMixin: false,
      uri: '/api/scl/v1/scl/sclInspectionTasks/',
      deleteAllId: 'sclInspectionTasksIds'
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getRoadTypeList')
  },
  mounted() {},
  methods: {
    handlePageJump(row) {
      if (row.pavementRoadbedType === 'LM') {
        this.$router.push(`/sys/pavementAnalysis?taskId=${row.id}`)
      } else if (row.pavementRoadbedType === 'LJ') {
        this.$router.push(`/sys/roadbedAnalysis?taskId=${row.id}`)
      }
    }
  }
}
</script>
<style scoped lang="scss">
</style>
