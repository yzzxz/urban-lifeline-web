<template>
  <div class="app-container">
    <!-- 问题项目 -->
    <div class="flex header">
      <span v-for="item in roadTaskList" :key="item.id" class="title" @click="handleSelectTask(item)">{{ item.missionName }}</span>
      <!--      <el-link type="primary" :underline="false" @click="handleBack">-->
      <!--        <svg-icon icon-class="return" /> 返回列表-->
      <!--      </el-link>-->
    </div>

    <!--  统计图表  -->
    <el-tabs value="tab">
      <el-tab-pane name="tab">
        <span slot="label">
          <svg-icon icon-class="road-disease-analysis" /> 病害信息
        </span>

        <div class="chart-container flex">
          <chart-bar :data="chartData" />
          <div class="vertical-line" />
          <chart-pie :data="chartData" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane name="tab1">
        <span slot="label">
          <svg-icon icon-class="road-disease-analysis" /> 问题项
        </span>
        <!-- 列表查询搜索框 -->
        <el-form :model="query" inline class="query-form">
          <el-form-item label="病害类别">
            <el-select v-model="query.patrolVirus" placeholder="请选择" clearable>
              <el-option v-for="item in $store.state.dict.pavementList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="道路名称">
            <el-select v-model="query.wayName" clearable>
              <el-option v-for="item in $store.state.dict.positionList" :key="item.value" :label="item.label" :value="item.label" />
            </el-select>
          </el-form-item>

          <el-form-item label=" " label-width="2rem">
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
            <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
          </el-form-item>
        </el-form>

      </el-tab-pane>

      <el-tab-pane name="tab2">
        <span slot="label">
          <svg-icon icon-class="road-advice" /> 汇总页
        </span>
        <el-radio-group v-model="query.status" style="margin-bottom: 30px;" @change="handleQuery">
          <el-radio-button v-for="item in statusOptions" :key="item.status" :label="item.status">{{ item.label }}</el-radio-button>
        </el-radio-group>

      </el-tab-pane>
    </el-tabs>

    <!-- 列表 -->
    <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
      <!-- <el-table-column type="selection" width="55" :reserve-selection="true" align="center" /> -->
      <el-table-column label="序号" width="60" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="virusNumber" label="病害编号" min-width="100" />

      <el-table-column prop="patrolVirus" label="巡查病害" min-width="120" :formatter="formatPatrolVirus" />
      <!--      <el-table-column prop="diseaseAddr" label="病害位置" min-width="120" />-->
      <el-table-column prop="wayName" label="道路名称" min-width="120" :formatter="formatWayName" />
      <el-table-column prop="roadSectionName" label="道路范围(起-始)" min-width="120" />

      <el-table-column v-if="activeName==='tab1'" prop="remarkOpinion" label="备注意见" min-width="120" show-overflow-tooltip />

      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template v-slot="scope">
          <el-link type="primary" :underline="false" @click="handleViewPic(scope.row)">
            查看图片
          </el-link>
          <el-divider direction="vertical" />
          <el-link v-if="activeName==='tab1'" type="primary" :underline="false" @click="handleEdit(scope.row)">
            销项
          </el-link>
          <el-popconfirm v-else title="确定要还原吗?" @confirm="()=>handleReduced(scope.row)">
            <el-link slot="reference" type="primary" :underline="false">
              还原
            </el-link>
          </el-popconfirm>
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

    <!-- 销项弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :active-name="activeName" :form-data="formData"
                 @closeDialog="handleCloseDialog" @addFormData="addFormData" @editFormData="editFormData" />
    <!-- 查看图片 -->
    <el-dialog title="查看图片" :visible.sync="showImage" width="50rem" append-to-body :close-on-click-modal="true">
      <table class="tg">
        <tbody>
          <tr>
            <td class="label">病害类别</td>
            <td>{{ formatPatrolVirus('','',formData.patrolVirus) }}</td>
          </tr>
          <tr>
            <td class="img" colspan="2" style="text-align: center">
              <el-image :src="formData.picture | imageUrlFilter" style="width:600px;" />
            </td>
          </tr>
        </tbody>
      </table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showImage = false">取 消</el-button>
        <el-button type="primary" @click="showImage = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'

import ChartBar from './components/chartBar'
import ChartPie from './components/chartPie'

/**
 * 路面病害分析
 */
export default {
  name: 'PavementDetails',
  components: {
    FormDialog,
    ChartBar,
    ChartPie
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclPavementAnalyse/',
      deleteAllId: 'pavementDetailIds',
      query: {
        taskId: ''
      },
      // 巡检任务列表
      roadTaskList: [],

      statusOptions: [
        {
          status: '1',
          label: '检修暂缓'
        },
        {
          status: '2',
          label: '误报'
        },
        {
          status: '3',
          label: '上报'
        }
      ],

      activeName: 'tab1',

      // 图片弹窗
      showImage: false,

      //  图表
      chartData: []
    }
  },

  async beforeCreate() {
    await this.$store.dispatch('dict/getPavementList')
    await this.$store.dispatch('dict/getRoadTypeList')
    await this.$store.dispatch('dict/getPositionList')
  },
  created() {
    // 根据taskId过滤列表
    // this.query.taskId = this.$route.query.taskId
    this.getRoadTaskList()
  },
  methods: {
    /**
     * 获取路面巡检任务列表
     */
    getRoadTaskList() {
      this.$http({
        url: '/api/scl/v1/scl/sclInspectionTasks/',
        method: 'get',
        params: {
          pavementRoadbedType: 'LM'
        }
      }).then(res => {
        this.roadTaskList = res.data.dataList

        // this.query.taskId = this.roadTaskList[0].id
        if (this.roadTaskList && this.roadTaskList.length) {
          this.handleSelectTask(this.roadTaskList[0])
        }
      })
    },
    // 选择巡检任务
    handleSelectTask(task) {
      this.query.taskId = task.id

      this.handleQuery()
      this.getChartData()
    },

    getChartData() {
      this.$http.get('/api/scl/v1/scl/sclPavementAnalyse/analyseCount?taskId=' + this.query.taskId).then((res) => {
        if (res?.code === 1 && res.data) {
          this.chartData = Object.keys(res.data).map((key) => {
            return {
              name: this.$store.state.dict.pavementList.find(i => i.value === key).label,
              value: res.data[key]
            }
          })
          console.log(this.chartData)
          // this.riskNumTotal = this.chartDataList.reduce((prev, curr) => {
          //   return Number(prev || 0) + curr.sum
          // }, 0)
        }
      })
    },

    handleTabClick(tab) {
      this.activeName = tab.name
      if (this.activeName === 'tab2') {
        this.query = {
          taskId: this.$route.query.taskId,
          status: '1'
        }
      } else {
        this.query = {
          taskId: this.$route.query.taskId
        }
      }
      this.handleQuery()
    },

    // 查看图片
    handleViewPic(row) {
      this.formData = { ...row }
      this.showImage = true
    },

    // 还原
    handleReduced(row) {
      const para = {
        id: row.id,
        status: ''
      }
      this.editFormData(para)
    },

    // 返回列表
    handleBack() {
      this.$router.go(-1)
    },

    formatWayName(row, col, cellVal) {
      return (
        this.$store.state.dict.positionList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatPatrolVirus(row, col, cellVal) {
      return (
        this.$store.state.dict.pavementList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 16px;

  .chart-container {
    height: 32vh;

    border-bottom: 1px solid #ebeef5;

    .vertical-line {
      width: 1px;
      min-width: 1px;
      margin: 0 1rem;
      height: calc(100% - 2rem);
      background-color: #ebeef5;
    }
  }

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
</style>
