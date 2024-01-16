<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline label-width="6rem" class="query-form">
      <el-form-item label="道路名称">
        <el-input v-model="query.locationName" maxlength="20" clearable />
      </el-form-item>

      <el-form-item label="道路编码">
        <el-input v-model="query.locationCode" maxlength="20" clearable />
      </el-form-item>

      <el-form-item label="道路类型">
        <!--        <el-select v-model="query.type" clearable>-->
        <!--          <el-option v-for="item in $store.state.dict.roadTypeList" :key="item.value" :label="item.label" :value="item.value" />-->
        <!--        </el-select>-->
        <dict-select ref="roadTypeSelect" v-model="query.type" dict-code="SCL_ROAD_TYPE" type="select" clearable />
      </el-form-item>

      <el-form-item label="路段类型">
        <!--        <el-select v-model="query.type" clearable>-->
        <!--          <el-option v-for="item in $store.state.dict.roadTypeList" :key="item.value" :label="item.label" :value="item.value" />-->
        <!--        </el-select>-->
        <dict-select ref="roadCheckTypeSelect" v-model="query.checkType" dict-code="SCL_ROAD_CHECK_TYPE_LIST" type="select" clearable />
      </el-form-item>

      <el-form-item label=" " label-width="2rem">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表操作按钮 -->
    <div class="table-buttons">

      <!-- <el-upload action="#" :http-request="(param)=>handleUpload(param, null)" accept=".xls,.xlsx" :show-file-list="false"
                 :before-upload="beforeUpload" style="display:inline-block;margin-right:1rem">
        <el-button type="success" icon="el-icon-upload"> 导入 </el-button>
      </el-upload> -->

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

      <el-table-column prop="evaluationUnitId" label="评估单元（范围）" min-width="160" :formatter="formatEvaluationUnitName" show-overflow-tooltip />
      <el-table-column prop="locationCode" label="道路编码" min-width="100" />
      <el-table-column prop="locationName" label="道路名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="addr" label="所在区域" min-width="120" />
      <el-table-column prop="extent" label="长度(m)" min-width="100" />
      <el-table-column prop="breadth" label="宽度(m)" min-width="100" />
      <el-table-column prop="point" label="起始点" min-width="150" />
      <el-table-column prop="laneCount" label="车道数" min-width="100" />
      <el-table-column prop="laneTotalCount" label="总车道(m)" min-width="100" />
      <el-table-column prop="type" label="类型" min-width="100" :formatter="formatRoadTypeName" />
      <el-table-column prop="checkType" label="路段类型" min-width="100" :formatter="formatRoadCheckTypeName" />
      <el-table-column prop="remarks" label="备注" min-width="120" show-overflow-tooltip />

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
      <el-pagination small :current-page.sync="pageNum" :page-sizes="pageSizeList" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                     :total="total" background @size-change="handleChangePageSize" @current-change="handleChangePage" />
    </div>

    <!-- 表单编辑弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" :evaluation-unit-list="evaluationUnitList" @closeDialog="handleCloseDialog"
                 @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
/**
 * 道路位置管理
 */
export default {
  name: 'LocationManage',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclLocation/',
      deleteAllId: 'sclProjectIds',

      evaluationUnitList: []
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getRoadTypeList')
  },
  created() {
    this.getEvaluationUnitList()
  },
  mounted() {},
  methods: {
    // 获取评估单元列表
    getEvaluationUnitList() {
      this.$http.get('/api/scl/v1/scl/sclEvaluation/dropdown').then(res => {
        if (res?.code === 1 && res.data) {
          this.evaluationUnitList = Object.keys(res.data).map(key => {
            return {
              label: res.data[key],
              value: key
            }
          })
        }
      })
    },
    formatRoadTypeName(row, col, cellVal) {
      return (
        this.$refs['roadTypeSelect'].getCurrentDictOptions().find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatRoadCheckTypeName(row, col, cellVal) {
      return (
        this.$refs['roadCheckTypeSelect'].getCurrentDictOptions().find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatEvaluationUnitName(row, col, cellVal) {
      return (
        this.evaluationUnitList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
</style>
