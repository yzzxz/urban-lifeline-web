<template>
  <div class="app-container">
    <el-form inline :model="query">
      <el-form-item label="名称">
        <el-input v-model="query.camName" clearable placeholder="请输入名称查询" />
      </el-form-item>

      <el-form-item label=" " label-width="15px">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="table-buttons">
      <el-button icon="el-icon-plus" type="primary" @click="handleCreate">新建</el-button>
      <el-button icon="el-icon-s-operation" type="success" @click="sortVisible = true">视频墙排序</el-button>
    </div>
    <el-table ref="tableWrapper" v-loading="tableLoading" border :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column prop="camName" label="设备名称" min-width="120" />
      <el-table-column prop="camSerialNo" label="设备类型" min-width="100" />
      <el-table-column prop="camSerial" label="序列号" min-width="120" />
      <el-table-column prop="areaNo" label="工区" min-width="100">
        <template v-slot="scope">
          {{ scope.row.areaNo | areaNoFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="pitNo" label="基坑" min-width="120" />
      <el-table-column prop="functionName" label="功能" min-width="120" :formatter="formatFuncName" />
      <!-- <el-table-column prop="address" label="地址" min-width="120" /> -->
      <el-table-column prop="linkAddress" label="视频流地址" min-width="120" show-overflow-tooltip />
      <el-table-column prop="linkAddress2" label="备用视频流地址" min-width="120" show-overflow-tooltip />
      <el-table-column prop="linkAddress3" label="视频子码流地址" min-width="120" show-overflow-tooltip />
      <el-table-column prop="wallFlag" label="是否视频墙展示" width="120" align="center">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.wallFlag" active-value="1" inactive-value="0" @change="handleChangeWallFlag(scope.row)" />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-link :underline="false" icon="el-icon-edit" type="warning" @click="handleEdit(scope.row)" />
          <el-link :underline="false" icon="el-icon-delete" type="danger" @click="handleDelete(scope.row.id)" />
        </template>
      </el-table-column>

      <template slot="empty">
        <el-empty description="暂无数据" />
      </template>
    </el-table>
    <div class="pagination-box">
      <el-pagination small :current-page.sync="pageNum" :page-sizes="[10, 20, 25, 50]" :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleChangePageSize"
                     @current-change="handleChangePage" />
    </div>

    <FormDialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" :func-option-list="funcList"
                @closeDialog="handleCloseDialog" @addFormData="addFormData" @editFormData="editFormData" />

    <SortDialog :is-show="sortVisible" @closeDialog="handleCloseSortDialog" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
import SortDialog from './dialog/sortDialog.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    FormDialog,
    SortDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      sortVisible: false,
      query: {
        createByName: ''
      },
      uri: '/api/sec/v1/sec/secCamera/',
      pageSize: 20
    }
  },
  computed: {
    ...mapGetters(['funcList'])
  },
  async created() {
    await this.$store.dispatch('dict/getFuncList')
  },
  mounted() {},
  methods: {
    handleChangeWallFlag(row) {
      this.$http({
        url: this.uri,
        method: 'put',
        data: {
          id: row.id,
          wallFlag: row.wallFlag
        }
      }).then((res) => {
        if (res.code === 1) {
          this.$message.success('修改成功！')
        }
      })
    },
    // 格式化摄像头功能显示
    formatFuncName(row, column, cellValue) {
      const funcArr = cellValue.split(';')
      let str = ''
      if (Array.isArray(funcArr) && funcArr.length > 0) {
        funcArr.map((func) => {
          const findItem = this.funcList.find((item) => item.value === func)
          if (findItem) {
            str += findItem.label + '；'
          }
        })
      }
      return str.substring(0, str.length - 1) || cellValue
    },
    handleCloseSortDialog() {
      this.sortVisible = false
      this.getList()
    }
  }
}
</script>
<style scoped>
</style>
