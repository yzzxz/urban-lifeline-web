<template>
  <div class="app-container">

    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form">
      <el-form-item label="病害类别">
        <el-select v-model="query.patrolVirus" placeholder="请选择" clearable>
          <el-option v-for="item in $store.state.dict.roadbedTypeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="道路名称">
        <dict-select ref="position-list" v-model="query.wayName" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                     :dropdown-params="{checkType:'BHFX'}" />
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
          新增
        </el-button>
        <el-button type="primary" plain icon="el-icon-delete" @click="handleDeleteBatch">
          批量删除
        </el-button>
      </div>
      <!-- 列表 -->
      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
                :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" width="60" align="center">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="diseaseNumber" label="病害编号" min-width="120" />
        <el-table-column prop="wayName" label="道路名称" min-width="120" :formatter="formatWayName" />
        <el-table-column prop="diseaseSort" label="病害类别" min-width="120" :formatter="formatDiseaseSort" />
        <el-table-column prop="topDepth" label="顶部埋深(m)" min-width="120" />
        <el-table-column prop="planeSize" label="平面尺寸(㎡)" min-width="120" />
        <el-table-column prop="coordinatesOrientation" label="坐标定位" min-width="120" />
        <el-table-column prop="riskAssessment" label="塌陷发生可能性" min-width="120" />
        <el-table-column prop="disposalProposal" label="处置建议" min-width="120" show-overflow-tooltip />

        <el-table-column label="操作" width="120" align="center" fixed="right">
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
        <el-pagination small :current-page.sync="pageNum" :page-sizes="pageSizeList" :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleChangePageSize"
                       @current-change="handleChangePage" />
      </div>
    </div>

    <!-- 表单编辑弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData"
                 @closeDialog="handleCloseDialog" @addFormData="addFormData" @editFormData="editFormData" />

  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
/**
 * 路基病害管理
 */
export default {
  name: 'RoadbedAnalysis',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclRoadbedAnalyse/',
      deleteAllId: 'sclRoadbedAnalyseIds',
      query: {
        taskId: ''
      }
    }
  },

  async beforeCreate() {
    await this.$store.dispatch('dict/getRoadbedTypeList')
    await this.$store.dispatch('dict/getRoadTypeList')
  },
  created() {
    this.query.taskId = this.$route.query.taskId
  },
  mounted() {},
  methods: {
    formatDiseaseSort(row, col, cellVal) {
      return (
        this.$store.state.dict.roadbedTypeList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatWayName(row, col, cellVal) {
      return (
        this.$refs['position-list'].getCurrentDictOptions().find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
</style>
