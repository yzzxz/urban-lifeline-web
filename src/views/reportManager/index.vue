<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline class="query-form">
      <el-form-item label="报告类型">
        <el-input v-model="query.param" />
      </el-form-item>
      <el-form-item label="生成日期">
        <el-date-picker v-model="createDate" type="datetimerange" :picker-options="pickerOptions" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" align="right" />
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
        新建报告
      </el-button>

    </div>
    <!-- 列表 -->
    <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
      <el-table-column label="序号" width="60" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="报告名称" min-width="120" />

      <el-table-column prop="type" label="报告类型" min-width="120">
        <template v-slot="scope">
          {{ scope.row.type === 'LM' ? '路面巡检' : '路基巡检' }}
        </template>
      </el-table-column>

      <el-table-column prop="createDate" label="生成日期" min-width="120">
        <template v-slot="scope">
          {{ scope.row.createDate | dateTimeFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" min-width="120" show-overflow-tooltip />

      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template v-slot="scope">
          <el-link type="primary" :underline="false" @click="handleEdit(scope.row)">
            编辑
          </el-link>
          <el-divider direction="vertical" />
          <!--          <el-link type="primary" :underline="false">-->
          <!--            查看-->
          <!--          </el-link>-->
          <!--          <el-divider direction="vertical" />-->
          <el-link type="primary" :underline="false" @click="handleDownload(scope.row)">
            下载
          </el-link>
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

    <!-- 表单编辑弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" @closeDialog="handleCloseDialog"
                 @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
import { getToken } from '@/utils/auth'
export default {
  name: 'ReportManage',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      // curdMountedMixin: false,
      uri: '/api/scl/v1/scl/sclLocationTaskReport/',
      deleteAllId: 'sclLocationTaskReportIds',
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      createDate: '',
      tableData: []
    }
  },

  watch: {
    createDate: {
      handler: function(val) {
        if (val && val.length === 2) {
          this.query.createDateStart = val[0]
          this.query.createDateEnd = val[1]
        } else {
          this.query.createDateStart = ''
          this.query.createDateEnd = ''
        }
      },
      // immediate: true,
      deep: true
    }
  },
  activated() {},
  mounted() {},
  methods: {
    handleDownload(row) {
      if (row.path) {
        window.open(row.path + '?token=' + getToken(), '_blank')
      } else {
        this.$message.error('获取报告路径出错！')
      }
    },

    addFormData(form) {
      const loading = this.$loading({
        lock: true,
        text: '正在生成报告，请稍候...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$http({
        url: this.uri.add || this.uri,
        method: 'post',
        data: form
      })
        .then((res) => {
          if (res?.code === 1) {
            this.$message.success('保存成功！')
            this.handleQuery()
            this.dialogVisible = false
          }
        })
        .finally(() => {
          loading.close()
        })
    }
  }
}
</script>
<style scoped lang="scss"></style>
