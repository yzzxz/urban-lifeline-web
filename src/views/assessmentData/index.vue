<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" label-width="6rem" class="query-form">
      <el-row :gutter="15">
        <el-col :span="6">
          <el-form-item label="道路名称">
            <dict-select ref="position-list" v-model="query.locationId" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                         :dropdown-params="{checkType:'FXPG'}" clearable placeholder="请选择" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="所在区域">
            <el-input v-model="query.addr" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="道路类型">
            <el-select v-model="query.type">
              <el-option v-for="item in $store.state.dict.roadTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建日期">
            <el-date-picker v-model="query.createDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="评估单元">
            <el-select v-model="query.evaluationUnitId">
              <el-option v-for="item in evaluationUnitList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="18" style="text-align:right">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
        </el-col>

      </el-row>

      <el-form-item label="" />
    </el-form>

    <div class="table-container">

      <!-- 列表操作按钮 -->
      <div class="table-buttons">

        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          新增评估信息
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
        <el-table-column prop="evaluationUnitId" label="评估单元" min-width="120" :formatter="formatEvaluationUnit" />

        <el-table-column prop="locationName" label="道路名称" min-width="120" />
        <el-table-column prop="extent" label="长度(m)" min-width="120" />
        <el-table-column prop="breadth" label="宽度(m)" min-width="120" />
        <el-table-column prop="type" label="类型" min-width="120" :formatter="formatType" />
        <el-table-column prop="addr" label="所在区域" min-width="120" />
        <el-table-column prop="createDate" label="创建日期" min-width="120">
          <template v-slot="scope">
            {{ scope.row.createDate | dateTimeFilter }}
          </template>
        </el-table-column>

        <el-table-column prop="possibilityEvaluation" label="可能性评价" min-width="120">
          <template v-slot="scope">
            <span v-if="!!scope.row.possibilityEvaluation" class="tag active">已配置</span>
            <span v-else class="tag inactive">未配置</span>
          </template>
        </el-table-column>
        <el-table-column prop="consequenceAssessment" label="后果评价" min-width="120">
          <template v-slot="scope">
            <span v-if="!!scope.row.consequenceAssessment" class="tag active">已配置</span>
            <span v-else class="tag inactive">未配置</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="scope">
            <!--            <el-link type="primary" :underline="false" @click="handleView(scope.row)">-->
            <!--              查看-->
            <!--            </el-link>-->
            <!--            <el-divider direction="vertical" />-->
            <el-link type="primary" :underline="false" @click="handleEdit(scope.row)">
              配置
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
  name: 'AssessmentData',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclLocationTask/',
      deleteAllId: 'sclLocationTaskIds',

      // 评估单元下拉选
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
      this.$http.get('/api/scl/v1/scl/sclEvaluation/dropdown').then((res) => {
        if (res?.code === 1 && res.data) {
          this.evaluationUnitList = Object.keys(res.data).map((key) => {
            return {
              label: res.data[key],
              value: key
            }
          })
        }
      })
    },

    handleCreate() {
      this.$router.push('/riskManage/assessmentInfo')
    },
    handleEdit(row) {
      this.$router.push(`/riskManage/assessmentInfo?id=${row.id}`)
    },

    formatEvaluationUnit(row, col, cellVal) {
      return (
        this.evaluationUnitList.find((i) => i.value === cellVal)?.label ||
        cellVal
      )
    },
    formatType(row, col, cellVal) {
      return (
        this.$store.state.dict.roadTypeList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 0;

  .query-form {
    padding: 12px 16px;

    .el-select,
    .el-input,
    .el-date-editor {
      width: 100%;
    }
  }

  .table-container {
    padding: 12px 16px;

    .tag {
      &::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 0.25rem;
      }
    }

    .active::before {
      background-color: #3eb973;
    }

    .inactive::before {
      background-color: #a1abbb;
    }
  }
}
</style>
