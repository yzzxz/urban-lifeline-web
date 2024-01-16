<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline label-width="6rem" class="query-form">
      <el-form-item label="道路名称">
        <dict-select ref="position-list" v-model="query.locationId" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                     :dropdown-params="{checkType:'FXPG'}" />
      </el-form-item>

      <el-form-item label="生成日期">
        <el-date-picker v-model="query.createDate" type="date" clearable />
      </el-form-item>

      <el-form-item label=" " label-width="2rem">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-container">
      <!-- 列表操作按钮 -->
      <div class="table-buttons">
        <el-button type="primary" icon="el-icon-document" plain @click="handleGenerateReport">
          生成报告
        </el-button>
      </div>
      <!-- 列表 -->
      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableDataComputed"
                :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" :reserve-selection="true" align="center" />
        <el-table-column label="序号" width="60" align="center">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="evaluationUnitId" label="评估单元" min-width="120" :formatter="formatEvaluationUnit" />

        <el-table-column prop="locationName" label="道路名称" min-width="120" />
        <el-table-column prop="extent" label="长度(m)" min-width="100" />
        <el-table-column prop="breadth" label="宽度(m)" min-width="100" />
        <el-table-column prop="type" label="道路类型" min-width="100" :formatter="formatRoadType" />
        <!--        <el-table-column prop="addr" label="所在区域" min-width="120" />-->
        <el-table-column label="风险发生可能性评价" align="center">
          <el-table-column prop="possibilityEvaluation" label="可能性评分" min-width="100">
            <template v-slot="scope">
              <el-link type="primary" @click="handleViewDetail(scope.row, '可能性指标')">{{ scope.row.possibilityEvaluation }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="possibilityEvaluation" label="可能性等级" min-width="100">
            <template v-slot="scope">
              {{ scope.row.possibilityEvaluationLevel }}
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="风险发生后果评价" align="center">
          <el-table-column prop="consequenceAssessment" label="后果评分" min-width="100">
            <template v-slot="scope">
              <el-link type="primary" @click="handleViewDetail(scope.row, '后果指标')">{{ scope.row.consequenceAssessment }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="possibilityEvaluation" label="后果等级" min-width="100">
            <template v-slot="scope">
              {{ scope.row.consequenceAssessmentLevel }}
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column prop="" label="风险等级" min-width="100">
          <template v-slot:header>
            <span>风险等级</span>
            <el-popover placement="top">
              <img src="@/assets/images/warning-tip-table.png" alt="" width="882">
              <el-link slot="reference" :underline="false" icon="el-icon-info" style="margin-left: 0.5rem;margin-bottom: 0.5rem" />
            </el-popover>
          </template>
          <template v-slot="scope">
            <span :class="'dot dot-'+scope.row.riskLevel" />  {{ roadRiskLevel[scope.row.riskLevel] ? roadRiskLevel[scope.row.riskLevel].label:'' }}
          </template>
        </el-table-column>

        <el-table-column prop="" label="处置建议" min-width="200">
          <template v-slot="scope">
            {{ roadRiskLevel[scope.row.riskLevel] ? roadRiskLevel[scope.row.riskLevel].advice:'' }}
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
    <!--  评分详情弹窗  -->
    <detail-dialog :index-classification="targetType" :form-data="taskData" :is-show="showDetail" @closeDialog="showDetail = false" />

    <!--  生成报告弹窗  -->
    <el-dialog title="生成报告" :visible.sync="dialogVisible" width="32rem" append-to-body :before-close="()=>{dialogVisible = false}">
      <el-form label-width="6rem" style="margin-top: 2rem;padding-right: 2rem">
        <el-form-item label="报告名称">
          <el-input v-model="reportName" placeholder="请输入报告名称" maxlength="30" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="exportLoading" @click="handleGenerate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import qs from 'qs'
import BaseCurd from '@/mixin/BaseCurd'
import DetailDialog from './dialog/detailDialog.vue'
import { getToken } from '@/utils/auth'
export default {
  name: 'RiskAssessmentResult',
  components: {
    DetailDialog
  },
  filters: {

  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclLocationTask/',
      deleteAllId: 'sclLocationTaskIds',
      tableData: [],
      query: {
        locationId: ''
      },

      taskData: {},
      targetType: '',
      showDetail: false,

      reportName: '',
      exportLoading: false
    }
  },
  computed: {
    roadRiskLevel() {
      return this.$store.state.dict.roadRiskLevel
    },
    tableDataComputed() {
      return this.tableData.map(item => {
        const temp = {
          ...item,
          possibilityEvaluationLevel: this.formatPossibilityEvaluation(item.possibilityEvaluation),
          consequenceAssessmentLevel: this.formatConsequenceAssessment(item.consequenceAssessment)
        }
        temp.riskLevel = this.formatRiskLevel(temp.possibilityEvaluationLevel, temp.consequenceAssessmentLevel)
        return temp
      })
    }
  },

  async beforeCreate() {
    await this.$store.dispatch('dict/getRoadTypeList')
    await this.$store.dispatch('dict/getPositionList')
  },
  created() {
    this.getEvaluationUnitList()
  },
  mounted() {

  },
  methods: {
    // 批量选中，生成报告
    handleGenerateReport() {
      if (Array.isArray(this.tableData) && this.tableData.length === 0) {
        return this.$message.warning('列表暂无数据')
      }
      if (
        !this.multipleSelection || !Array.isArray(this.multipleSelection) ||
        this.multipleSelection.length === 0 || JSON.stringify(this.multipleSelection) === '{}'
      ) {
        return this.$message.warning('请先选择要生成报告的评估单元!')
      }

      this.reportName = ''
      this.dialogVisible = true
    },
    // 生成
    handleGenerate() {
      if (!this.reportName && !this.reportName.trim()) {
        return this.$message.warning('请先输入报告名称!')
      }
      this.exportLoading = true
      this.$http({
        url: '/api/scl/v1/scl/sclOutcomeReport/export',
        method: 'get',
        params: {
          name: this.reportName,
          taskIds: this.multipleSelection.map(i => i.id)
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false })
        }
      }).then(res => {
        if (res?.code === 1 && res?.data) {
          this.$message.success('生成报告成功!')
          const downloadUrl = res.data
          window.open(downloadUrl + '?token=' + getToken(), '_blank')
          this.dialogVisible = false
        } else {
          this.$message.error('生成失败!')
        }
      }).finally(() => {
        this.exportLoading = false
      })
    },

    // 查看评分详情
    handleViewDetail(row, type) {
      this.taskData = { ...row }
      this.targetType = type
      this.showDetail = true
    },
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
    formatEvaluationUnit(row, col, cellVal) {
      return this.evaluationUnitList.find(i => i.value === cellVal)?.label || cellVal
    },
    formatRoadType(row, col, cellVal) {
      return this.$store.state.dict.roadTypeList.find(i => i.value === cellVal)?.label || cellVal
    },
    // 可能性等级
    formatPossibilityEvaluation(val) {
      val = Number(val)
      if (val >= 0 && val < 30) {
        return 'A'
      } else if (val >= 30 && val < 50) {
        return 'B'
      } else if (val >= 50 && val < 70) {
        return 'C'
      } else if (val >= 70 && val < 90) {
        return 'D'
      } else if (val >= 90 && val <= 100) {
        return 'E'
      }
    },
    // 后果等级
    formatConsequenceAssessment(val) {
      val = Number(val)
      if (val >= 0 && val < 20) {
        return 1
      } else if (val >= 20 && val < 40) {
        return 2
      } else if (val >= 40 && val < 60) {
        return 3
      } else if (val >= 60 && val < 80) {
        return 4
      } else if (val >= 80 && val <= 100) {
        return 5
      }
    },
    formatRiskLevel(level1, level2) {
      const arr = [
        [1, 1, 2, 2, 3],
        [1, 2, 2, 3, 3],
        [2, 3, 3, 4, 4],
        [3, 4, 4, 5, 5],
        [4, 4, 5, 5, 5]
      ]
      const index = ['A', 'B', 'C', 'D', 'E'].indexOf(level1)
      return arr[index][level2 - 1]
    }
  }
}
</script>
<style scoped lang="scss">

</style>
