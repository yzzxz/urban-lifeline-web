<template>
  <div class="app-container">
    <!--    <el-form inline>-->
    <!--      <el-form-item label="操作用户">-->
    <!--        <el-input v-model="query.createByName" clearable placeholder="请输入用户名查询日志" />-->
    <!--      </el-form-item>-->

    <!--      <el-form-item label=" " label-width="15px">-->
    <!--        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>-->
    <!--        <el-button  icon="el-icon-refresh-right" @click="handleClearQuery">重置</el-button>-->
    <!--      </el-form-item>-->
    <!--    </el-form>-->

    <el-table ref="tableWrapper" v-loading="tableLoading" border :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column prop="operation" label="操作" min-width="120" />
      <el-table-column prop="type" label="日志类型" sortable min-width="120">
        <template v-slot:default="scope">
          {{ scope.row.type | logTypeFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="createByName" label="操作用户" min-width="120" />
      <el-table-column prop="remoteAddr" label="操作IP" min-width="120" />
      <el-table-column prop="requestUri" label="请求URI" min-width="120" />
      <el-table-column prop="responseTime" label="响应时间" min-width="120" />
      <el-table-column prop="createDate" label="操作时间" min-width="120">
        <template v-slot:default="scope">
          {{ scope.row.createDate | dateTimeFilter }}
        </template>
      </el-table-column>

      <template slot="empty">
        <el-empty description="暂无数据" />
      </template>
    </el-table>
    <div class="pagination-box">
      <el-pagination small :current-page.sync="pageNum" :page-sizes="[10, 20, 25, 50, 100]" :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleChangePageSize"
                     @current-change="handleChangePage" />
    </div>

  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'

export default {
  filters: {
    logTypeFilter: function(val) {
      if (val === 'CONNECTION') {
        return '接入日志'
      } else if (val === 'LOGIN') {
        return '登录日志'
      } else if (val === 'VALID') {
        return '验证失败日志'
      }
      return val
    }
  },
  mixins: [BaseCurd],
  data() {
    return {
      // query: {
      //   createByName: ''
      // },
      uri: '/api/sys/v1/sys/sysLog/',
      pageSize: 50
    }
  },

  methods: {}
}
</script>
