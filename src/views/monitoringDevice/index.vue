<template>
  <div class="app-container">

    <div class="chart-container">
      <div class="header">
        <span class="title">设备在线状态</span>
      </div>
      <div class="chart-list">
        <div v-for="(item,index) in chartDataList" :key="item.id" class="chart-box">
          <chart-pie :name="item.name" :color="chartList[index].color" :data="[item.onLine,item.offLine]" />
          <div class="chart-info">
            <div class="title">
              <span class="name">{{ item.name }}</span>
              <span class="count">{{ item.count }}</span>
            </div>
            <div class="num">

              <div class="num1">
                <div>在线</div>
                <div class="bg">{{ item.onLine }}</div>
              </div>
              <div class="num2">
                <div>离线</div>
                <div class="bg">{{ item.offLine }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="table-container">
      <div class="header">
        <span class="title">设备信息列表</span>
      </div>
      <!-- 列表查询搜索框 -->
      <el-form :model="query" inline label-width="5rem" class="query-form">
        <el-form-item label="设备位置" clearable>
          <dict-select ref="position-list" v-model="query.projectId" dropdown-url="/api/scl/v1/scl/sclLocation/dropdown"
                       :dropdown-params="{checkType:'SBJC'}" />
        </el-form-item>

        <el-form-item label="监测内容" clearable>
          <el-select v-model="query.checkType">
            <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备状态">
          <el-select v-model="query.state" clearable>
            <el-option label="在线" value="1" />
            <el-option label="离线" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label=" " label-width="2rem">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <!-- 列表操作按钮 -->
      <div class="table-buttons" style="margin-top: 1rem">
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          新增设备
        </el-button>
      </div>
      <!-- 列表 -->
      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
                :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">

        <el-table-column label="序号" width="60">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备序列号" min-width="120" />
        <el-table-column prop="deviceType" label="设备名称" min-width="120" :formatter="formatDeviceType" />
        <el-table-column prop="checkType" label="监测内容" min-width="120" :formatter="formatMonitoringItem" />
        <el-table-column prop="deviceName" label="测点编号" min-width="120" />
        <el-table-column prop="projectId" label="设备位置" min-width="150" :formatter="formatPosition" />
        <el-table-column prop="deviceCoordinates" label="设备坐标" min-width="150" />
        <!--        <el-table-column prop="" label="初始值" min-width="120" />-->
        <el-table-column prop="sampleFrequency" label="采样频率(HZ)" min-width="130" />
        <el-table-column prop="state" label="设备状态" width="100">
          <template v-slot="scope">
            <el-tag v-if="scope.row.state==='1'" type="success">在线</el-tag>
            <el-tag v-else>离线</el-tag>
          </template>
        </el-table-column>

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
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" @closeDialog="handleCloseDialog"
                 @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
import ChartPie from './components/chartPie.vue'
export default {
  name: 'TestPage',
  components: {
    FormDialog,
    ChartPie
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: {
        list: '/api/scl/v1/scl/sclDevice/dl',
        add: '/api/scl/v1/scl/sclDevice/dl',
        edit: '/api/scl/v1/scl/sclDevice/',
        del: '/api/scl/v1/scl/sclDevice/'
      },
      deleteAllId: 'sclDeviceIds',
      chartList: [
        {
          color: '#4279E4',
          icon: 'device1'
        },
        {
          color: '#FA9550',
          icon: 'device2'
        },
        {
          color: '#A236F4',
          icon: 'device3'
        },
        {
          color: '#F6685D',
          icon: 'device4'
        }
      ],
      chartDataList: []

    }
  },
  computed: {
    deviceTypeList() {
      return this.$store.state.dict.deviceTypeList
    }
  },

  watch: {
    // 监听设备类型列表，获取到字典之后再查询图表数据
    deviceTypeList: {
      handler: function(val) {
        if (val && val.length) {
          this.getChartData()
        }
      },
      immediate: true
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getMonitoringItemList')
    await this.$store.dispatch('dict/getDeviceTypeList')
  },

  methods: {
    getChartData() {
      this.$http.get('/api/scl/v1/scl/sclDevice/deviceCount').then((res) => {
        if (res?.code === 1 && res.data) {
          // console.log(res.data)
          this.chartDataList = Object.keys(res.data).map((key) => {
            return {
              id: key,
              name:
                this.deviceTypeList.find(
                  (i) => i.value === key
                )?.label || key,
              ...res.data[key]
            }
          })
        }
      })
    },

    formatMonitoringItem(row, col, cellVal) {
      return (
        this.$store.state.dict.monitoringItemList.find(
          (i) => i.value === cellVal
        )?.label || cellVal
      )
    },
    formatDeviceType(row, col, cellVal) {
      return (
        this.$store.state.dict.deviceTypeList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatPosition(row, col, cellVal) {
      return (
        this.$refs['position-list'].getCurrentDictOptions().find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  background: transparent;
  padding: 0;
}
.header {
  width: 100%;
  height: 3rem;
  line-height: 3rem;
  position: relative;
  span.title {
    font-size: 16px;
    color: #1d2129;
    font-weight: 600;
  }
}

.chart-container {
  width: 100%;
  height: 18rem;
  background: #fff;
  padding: 12px 16px;

  .chart-list {
    width: 100%;
    height: calc(100% - 3rem);

    display: flex;
    justify-content: space-between;
    align-items: center;

    .chart-box {
      width: 24%;
      height: 100%;
      margin: 0 8px;

      display: flex;
      align-items: center;
      .chart {
        width: calc(100% - 180px);
      }

      .chart-info {
        flex: 1;
        width: 180px;
        font-size: 18px;
        .title {
          border-top: 2px solid #4279e4;
          background-color: #f2f3ff;

          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 11px;

          .count {
            font-size: 30px;
            color: #4279e4;
          }
        }

        .num {
          display: flex;
          justify-content: space-around;
          text-align: center;
          margin-top: 1rem;
          font-size: 18px;
          .bg {
            width: 60px;
            height: 63px;
            background: url('~@/assets/images/num-bg.png') no-repeat 100%;

            line-height: 63px;

            color: #3b87d5;
            font-size: 26px;
            font-weight: bold;
          }
        }
      }
    }

    .chart-box:nth-child(1) .chart {
      background: url('~@/assets/images/device1.png') no-repeat center;
    }
    .chart-box:nth-child(2) .chart {
      background: url('~@/assets/images/device2.png') no-repeat center;
    }
    .chart-box:nth-child(3) .chart {
      background: url('~@/assets/images/device3.png') no-repeat center;
    }
    .chart-box:nth-child(4) .chart {
      background: url('~@/assets/images/device4.png') no-repeat center;
    }
  }
}
.table-container {
  background: #fff;
  padding: 12px 16px;
  margin-top: 3px;
}
</style>
