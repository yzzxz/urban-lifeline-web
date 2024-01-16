<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form">
      <el-form-item label="设备名称">
        <el-input v-model="query.deviceName" />
      </el-form-item>

      <el-form-item label="设备编码">
        <el-input v-model="query.deviceCode" />
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
          新增
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
        <el-table-column prop="deviceName" label="设备名称" min-width="120" />
        <el-table-column prop="deviceCode" label="设备编码" min-width="120" />
        <el-table-column prop="deviceType" label="设备类型" min-width="120" />
        <!--        <el-table-column prop="checkType" label="监测内容" min-width="120" />-->
        <el-table-column prop="projectId" label="项目名称" min-width="120" :formatter="formatProjectName" />
        <el-table-column prop="projectId" label="项目编码" min-width="120" :formatter="formatProjectCode" />

        <el-table-column prop="state " label="在线状态" min-width="120">
          <template v-slot="scope">
            <el-tag v-if="scope.row.state==='1'" type="success">在线</el-tag>
            <el-tag v-else>离线</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="state " label="设备状态" min-width="120">
          <template v-slot="scope">
            <span v-if="scope.row.state==='1'">
              <svg-icon icon-class="discount-filled" style="color:#56C08D" /> 正常
            </span>
            <span v-else>
              <svg-icon icon-class="discount-filled" style="color:#AD352F" /> 告警
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleView(scope.row)">
              查看
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
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :is-edit-batch="isEditBatch" :form-data="formData"
                 @closeDialog="handleCloseDialog" @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
/**
 * 阈值管理
 */
export default {
  name: 'Threshold',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclDevice/',
      deleteAllId: 'sclDeviceIds',

      isEditBatch: false
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getProjectList')
  },
  mounted() {},
  methods: {
    formatProjectName(row, col, cellVal) {
      return (
        this.$store.state.dict.projectList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatProjectCode(row, col, cellVal) {
      return (
        this.$store.state.dict.projectList.find((i) => i.value === cellVal)
          ?.code || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 0;

  .query-form {
    padding-top: 12px;
  }
  .table-container {
    margin-top: 1rem;
    padding: 0 16px 12px 16px;
  }
}
</style>
