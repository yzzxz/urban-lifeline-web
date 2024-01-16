<template>
  <div class="app-container">
    <!-- 问题项目 -->
    <div class="flex header">
      <span v-for="item in roadTaskList" :key="item.id" class="title" @click="handleSelectTask(item)">{{ item.missionName }}</span>
      <!--      <el-link type="primary" :underline="false" @click="handleBack">-->
      <!--        <svg-icon icon-class="return" /> 返回列表</el-link>-->
    </div>

    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane name="list">
        <span slot="label">
          <svg-icon icon-class="road-disease-analysis" /> 病害信息
        </span>

        <div class="chart-list">
          <el-empty v-if="chartDataList.length===0" :image-size="80" description="暂无统计数据" style="margin: auto" />
          <div v-for="item in chartDataList" :key="item.id" class="chart-box">
            <chart-pie :name="item.name" :formatter="item.value" :color="chartList[item.id-1].color" :data="[item.sum, riskNumTotal]" />
            <div class="chart-info">
              <div class="title">
                <span class="name">{{ item.label }}</span>
                <span class="count">{{ item.sum }}</span>
              </div>
              <div class="num">
                <!--  根据风险类型列表，按序渲染  -->
                <div v-for="i in $store.state.dict.roadbedTypeList" :key="i.value">
                  <div class="num1">{{ i.label }}</div>
                  <div class="bg">{{ item[i.value] || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-divider />
      </el-tab-pane>

      <!--      <el-tab-pane name="advice">-->
      <!--        <span slot="label"><svg-icon icon-class="road-advice" /> 处置建议</span>-->
      <!--      </el-tab-pane>-->
    </el-tabs>

    <div class="table-container">
      <!-- 查询条件 -->
      <el-form :model="query" inline class="query-form">
        <el-form-item label="风险评估等级">
          <el-select v-model="query.riskAssessment" placeholder="请选择" clearable>
            <el-option v-for="key in Object.keys(roadRiskLevel)" :key="key" :label="roadRiskLevel[key].label + '级'" :value="key" />
          </el-select>
        </el-form-item>

        <el-form-item label="病害类别">
          <el-select v-model="query.diseaseSort" placeholder="请选择" clearable>
            <el-option v-for="item in $store.state.dict.roadbedTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="道路名称">
          <el-select v-model="query.wayName" clearable>
            <el-option v-for="item in positionList" :key="item.value" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label=" " label-width="2rem">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
                :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
        <el-table-column label="序号" width="60" align="center">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="diseaseNumber" label="病害编号" min-width="120" />

        <el-table-column prop="wayName" label="道路名称" min-width="150" :formatter="formatWayName" />
        <el-table-column prop="diseaseSort" label="病害类别" min-width="120" :formatter="formatDiseaseSort" />
        <!--        <el-table-column prop="topDepth" label="顶部埋深(m)" min-width="120" />-->
        <!--        <el-table-column prop="planeSize" label="平面尺寸(㎡)" min-width="120" />-->
        <!--        <el-table-column prop="coordinatesOrientation" label="坐标定位" min-width="120" />-->

        <el-table-column prop="riskAssessment" label="风险评估等级" min-width="120">
          <template v-slot="scope">
            <span :class="'dot dot-'+scope.row.riskAssessment" />{{ formatRiskLevel(scope.row.riskAssessment, 'label') }}级
          </template>
        </el-table-column>

        <el-table-column prop="disposalProposal" label="处置建议" min-width="200" />

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleView(scope.row)">
              详情
            </el-link>
            <el-divider direction="vertical" />
            <!-- TODO 2023.12.28 演示，暂时放个假的  @click="handleEdit(scope.row)" -->
            <el-link type="primary" :underline="false">
              销项
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

    <!-- 弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" :position-list="positionList"
                 @closeDialog="handleCloseDialog" @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
import ChartPie from './components/chartPie.vue'

export default {
  name: 'PavementDetails',
  components: {
    FormDialog,
    ChartPie
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclRoadbedAnalyse/',
      deleteAllId: 'sclRoadbedAnalyseIds',
      query: {
        taskId: ''
      },
      activeName: 'list',
      positionList: [],
      // 巡检任务列表
      roadTaskList: [],

      chartList: [
        {
          color: '#4279E4'
        },
        {
          color: '#3EB973'
        },
        {
          color: '#f0d550'
        },
        {
          color: '#f08d50'
        },
        {
          color: '#eb595c'
        }
      ],
      chartDataList: [],
      riskNumTotal: 0
    }
  },
  computed: {
    roadRiskLevel() {
      return this.$store.state.dict.roadRiskLevel
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getRoadbedTypeList')
    await this.$store.dispatch('dict/getRoadTypeList')
  },
  created() {
    // this.query.taskId = this.$route.query.taskId
    this.getPositionList()

    this.getRoadTaskList()
  },
  mounted() {
    this.getChartData()
  },
  methods: {
    /**
     * 获取路基巡检任务列表
     */
    getRoadTaskList() {
      this.$http({
        url: '/api/scl/v1/scl/sclInspectionTasks/',
        method: 'get',
        params: {
          pavementRoadbedType: 'LJ'
        }
      }).then((res) => {
        this.roadTaskList = res.data.dataList

        this.query.taskId = this.roadTaskList[0].id
      })
    },
    // 选择巡检任务
    handleSelectTask(task) {
      this.query.taskId = task.id

      this.handleQuery()
    },

    getPositionList() {
      this.$http({
        url: '/api/scl/v1/scl/sclLocation/dropdown',
        method: 'get',
        params: {
          checkType: 'BHFX'
        }
      }).then((res) => {
        if (res?.code === 1 && res.data) {
          this.positionList = Object.keys(res.data).map((key) => {
            return {
              label: res.data[key],
              value: key
            }
          })
        }
      })
    },
    handleTabClick(tab) {
      this.activeName = tab.name

      this.query = {
        taskId: this.$route.query.taskId
      }
      this.handleQuery()
    },

    getChartData() {
      this.$http
        .get(
          '/api/scl/v1/scl/sclRoadbedAnalyse/roadbedAnalyseCount?taskId=' +
            this.$route.query.taskId
        )
        .then((res) => {
          if (res?.code === 1 && res.data) {
            this.chartDataList = Object.keys(res.data).map((key) => {
              const item = res.data[key]
              return {
                id: key,
                label: this.roadRiskLevel[key].label + '级' || key,
                name: this.roadRiskLevel[key].name || key,
                sum: Object.keys(item).reduce((prev, curr) => {
                  return Number(item[curr] || 0) + prev
                }, 0),
                ...res.data[key]
              }
            })
            this.riskNumTotal = this.chartDataList.reduce((prev, curr) => {
              return Number(prev || 0) + curr.sum
            }, 0)
          }
        })
    },

    // 返回列表
    handleBack() {
      this.$router.go(-1)
    },

    formatRiskLevel(val, prop) {
      if (this.roadRiskLevel[val]) {
        return this.roadRiskLevel[val][prop] || val
      }
      return val
    },

    formatWayName(row, col, cellVal) {
      return (
        this.positionList.find((i) => i.value === cellVal)?.label || cellVal
      )
    },
    formatDiseaseSort(row, col, cellVal) {
      return (
        this.$store.state.dict.roadbedTypeList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 16px;

  .table-container {
    padding: 0;
  }
}

.query-form {
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.header {
  margin-bottom: 0.5rem;

  .title {
    font-size: 16px;
    font-weight: bold;
    margin-right: 1rem;
    cursor: pointer;
  }
}

.tg {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  color: #54607a;

  .img {
    height: 300px;
  }
}

.tg td {
  border: 1px solid #e5e5e5;
  font-size: 14px;
  overflow: hidden;
  padding: 10px 5px;
  word-break: normal;

  width: 180px;
  height: 40px;
  vertical-align: center;
}

.tg .label {
  background-color: #f3f8fc;
  text-align: right;
  width: 50px;
  padding-left: 10px;
  font-weight: 400;
  color: #303133;
}

.sum-btn {
  height: 36px;
  // background: red;
  // color: #ffffff;
  border: 1px solid #ccc;
  background-color: transparent;
}

.chart-list {
  width: 100%;
  height: 180px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  .chart-box {
    flex: 1;
    width: 20%;
    height: 100%;
    margin: 0 8px;

    display: flex;
    align-items: center;

    .chart {
      // width: calc(100% - 180px);
      width: 120px;
      height: 100%;
    }

    .chart-info {
      flex: 1;
      font-size: 18px;

      .title {
        border-top: 2px solid #4279e4;
        background-color: #f2f3ff;

        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 11px;

        .count {
          font-size: 26px;
          color: #4279e4;
          font-weight: bold;
        }
      }

      .num {
        display: flex;
        justify-content: space-around;
        text-align: center;
        margin-top: 1rem;
        font-size: 18px;

        .num1 {
          font-size: 18px;
          color: #51565b;
        }

        .bg {
          color: #3b87d5;
          font-size: 24px;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
