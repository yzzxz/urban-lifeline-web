<template>
  <div class="app-container">
    <div class="chart-container flex">
      <chart-pie />

      <div class="vertical-line" />

      <chart-stack-bar />
    </div>
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline label-width="6rem" class="query-form">
      <el-form-item label="预警类型">
        <el-select v-model="query.devType">
          <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="预警等级">
        <el-select v-model="query.warnLevel">
          <el-option :value="1" label="一级预警" />
          <el-option :value="2" label="二级预警" />
          <el-option :value="3" label="三级预警" />
        </el-select>
      </el-form-item>

      <el-form-item label="日期">
        <el-date-picker v-model="query.createDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" />
      </el-form-item>

      <el-form-item label="">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-container">
      <!-- 列表操作按钮 -->
      <div class="table-buttons">
        <el-button type="primary" plain @click="handleDeleteBatch">
          <svg-icon icon-class="destory-item" />
          批量销项
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
        <el-table-column prop="devType" label="预警类型" min-width="120" :formatter="formatDevType" />

        <el-table-column prop="locationId" label="预警位置" min-width="120" :formatter="formatPosition" />
        <el-table-column prop="createDate" label="预警时间" min-width="120">
          <template v-slot="scope">
            {{ scope.row.createDate | dateTimeFilter }}
          </template>
        </el-table-column>
        <el-table-column prop="devSn" label="预警设备" min-width="120" />
        <el-table-column prop="warnLevel" label="预警等级" min-width="100">
          <template v-slot="scope">
            <span class="dot" :class="'warn'+scope.row.warnLevel" />{{ scope.row.warnLevel | warningLevelFilter }}
          </template>
        </el-table-column>

        <el-table-column prop="remarks" label="处置建议" min-width="150" show-overflow-tooltip>
          <template v-slot="scope">
            <div v-if="scope.row.warnLevel===3">
              1、地下检测单位：探地雷达检测 <br>
              2、道路养护单位：日常巡检巡查重点关注
            </div>

            <div v-else-if="scope.row.warnLevel===2">
              1、地下检测单位：探地雷达加密检测<br>
              2、道路养护单位：制定计划进行消除
            </div>

            <div v-else-if="scope.row.warnLevel===1">
              1、园区综合行政执法局，启动应急联动预案<br>
              2、交管单位：交通管制、警示隔离、应急疏散<br>
              3、地下管线权属单位：排查及抢修<br>
              4、道路养护单位：现场排查及抢修
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleView(scope.row)">
              详情
            </el-link>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定要销项吗?" @confirm="()=>delFormData(scope.row.id)">
              <el-link slot="reference" type="primary" :underline="false">
                销项
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
import ChartStackBar from './components/chartStackBar.vue'
import ChartPie from './components/chartPie.vue'
import qs from 'qs'
export default {
  name: 'AlertManage',
  components: {
    FormDialog,
    ChartStackBar,
    ChartPie
  },

  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/scl/v1/scl/sclDeviceWarn/',
      deleteAllId: 'sclDeviceWarnIds'
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getPositionList')

    await this.$store.dispatch('dict/getDeviceTypeList')
  },
  mounted() {},
  methods: {
    // 批量销项
    handleDeleteBatch() {
      if (Array.isArray(this.tableData) && this.tableData.length === 0) {
        return this.$message.warning('列表暂无数据')
      }
      if (
        !this.multipleSelection ||
        !Array.isArray(this.multipleSelection) ||
        this.multipleSelection.length === 0 ||
        JSON.stringify(this.multipleSelection) === '{}'
      ) {
        return this.$message.warning('请先选择要销项的数据!')
      }
      this.$confirm('此操作将对所选预警项进行批量销项，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const arr = []
          this.multipleSelection.map((item) => {
            arr.push(item.id)
          })
          const params = {}
          params[this.deleteAllId] = arr
          this.$http({
            url: this.uri.delBatch || this.uri,
            method: 'delete',
            params,
            paramsSerializer: (params) => {
              return qs.stringify(params, { indices: false })
            }
          }).then((res) => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.handleQuery()

              // 表格清空选中项
              this.$nextTick(() => {
                this.$refs[this.tableRef] &&
                  this.$refs[this.tableRef].clearSelection()
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作已取消'
          })
        })
    },
    formatPosition(row, col, cellVal) {
      return (
        this.$store.state.dict.positionList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },

    formatDevType(row, col, cellVal) {
      return (
        this.$store.state.dict.monitoringItemList.find(
          (i) => i.value === cellVal
        )?.label || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 0;

  .chart-container {
    height: 40vh;

    border-bottom: 1px solid #ebeef5;

    .vertical-line {
      width: 1px;
      min-width: 1px;
      margin: 0 1rem;
      height: calc(100% - 2rem);
      background-color: #ebeef5;
    }
  }

  .query-form {
    padding-top: 12px;
  }
  .table-container {
    margin-top: 1rem;
    padding: 0 16px 12px 16px;
  }

}
</style>
