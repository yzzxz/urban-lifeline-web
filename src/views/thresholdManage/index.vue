<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline label-width="6rem" class="query-form">
      <el-form-item label="监测内容">
        <el-select v-model="query.checkType">
          <el-option v-for="item in $store.state.dict.monitoringItemList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="设备类型">
        <el-select v-model="query.deviceType">
          <el-option v-for="item in $store.state.dict.deviceTypeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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
          新增指标
        </el-button>
        <el-button type="primary" plain icon="el-icon-edit" @click="handleEditBatch">
          批量编辑
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
        <el-table-column prop="deviceCode" label="设备序列号" min-width="150" />
        <el-table-column prop="deviceType" label="设备名称" min-width="100" :formatter="formatDeviceType" />
        <el-table-column prop="checkType" label="监测内容" min-width="100" :formatter="formatMonitoringItem" />
        <el-table-column prop="deviceName" label="测点编号" min-width="120" />
        <el-table-column prop="projectId" label="设备位置" min-width="120" :formatter="formatPosition" />
        <el-table-column prop="deviceCoordinates" label="设备坐标" min-width="120" />
        <el-table-column prop="sampleFrequency" label="采样频率(HZ)" width="120" />
        <el-table-column prop="state " label="设备状态" width="100">
          <template v-slot="scope">
            <el-tag v-if="scope.row.state==='1'" type="success">在线</el-tag>
            <el-tag v-else>离线</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="warn1" label="一级预警" min-width="120">
          <template v-slot="scope">
            <div v-if="scope.row.paramType==='0'">
              {{ `±(${scope.row.warn1}, ∞)` }}
            </div>
            <div v-else-if="scope.row.paramType==='1'">
              {{ `(+${scope.row.warn1}, +∞)` }}
            </div>
            <div v-else-if="scope.row.paramType==='2'">
              {{ `(-∞, -${scope.row.warn1})` }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="warn2" label="二级预警" min-width="120">
          <template v-slot="scope">
            <div v-if="scope.row.paramType==='0'">
              {{ `±(${scope.row.warn3}, ${ scope.row.warn2})` }}
            </div>
            <div v-else-if="scope.row.paramType==='1'">
              {{ `(+${scope.row.warn3}, +${ scope.row.warn2})` }}
            </div>
            <div v-else-if="scope.row.paramType==='2'">
              {{ `(-${ scope.row.warn2}, -${scope.row.warn3})` }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="warn3" label="三级预警" min-width="120">
          <template v-slot="scope">
            <div v-if="scope.row.paramType==='0'">
              {{ `±(${scope.row.warn3}, ${ scope.row.warn2})` }}
            </div>
            <div v-else-if="scope.row.paramType==='1'">
              {{ `(+${scope.row.warn3}, +${ scope.row.warn2})` }}
            </div>
            <div v-else-if="scope.row.paramType==='2'">
              {{ `(-${ scope.row.warn2}, -${scope.row.warn3})` }}
            </div>

          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
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
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :is-edit-batch="isEditBatch" :form-data="formData"
                 @closeDialog="handleCloseDialog" @addFormData="addFormData" @editFormData="editFormData"
                 @editBatch="handleEditBatchSubmit" />
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
      uri: '/api/scl/v1/scl/sclDeviceParam/',
      deleteAllId: 'sclDeviceParamIds',
      query: {
        systemType: 'dl'
      },
      isEditBatch: false
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('dict/getPositionList')
    await this.$store.dispatch('dict/getMonitoringItemList')
    await this.$store.dispatch('dict/getDeviceTypeList')
  },
  mounted() {},
  methods: {
    handleClearQuery() {
      this.query = {
        systemType: 'dl'
      }
      this.handleQuery()
    },
    // 批量编辑
    handleEditBatch() {
      if (this.multipleSelection && this.multipleSelection.length) {
        if (
          Array.from(new Set(this.multipleSelection.map((i) => i.deviceType)))
            .length > 1
        ) {
          return this.$message.warning('请勾选相同类型的设备！')
        }

        this.isEditBatch = true
        this.addOrEdit = 1
        this.formData = {}
        this.dialogVisible = true
      } else {
        this.$message.warning('请先勾选需要批量修改的设备！')
      }
    },
    // 批量编辑保存
    handleEditBatchSubmit(formData) {
      const params = this.multipleSelection.map((item) => {
        return {
          id: item.id,
          ...formData
        }
      })
      this.$http({
        url: '/api/scl/v1/scl/sclDeviceParam/updateBatch',
        method: 'put',
        data: params
      })
        .then((res) => {
          if (res?.code === 1) {
            this.dialogVisible = false
            this.$message.success('批量编辑成功！')
            this.handleQuery()
          }
        })
        .finally(() => {
          this.isEditBatch = false
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
        this.$store.state.dict.positionList.find((i) => i.value === cellVal)
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
    padding-top: 12px;
  }
  .table-container {
    margin-top: 1rem;
    padding: 0 16px 12px 16px;
  }
}
</style>
