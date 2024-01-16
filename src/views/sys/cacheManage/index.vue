<template>
  <div class="app-container">
    <div class="table-buttons">
      <el-button type="primary" icon="el-icon-delete" @click="handleClearAll">全部清除</el-button>
    </div>
    <el-table ref="tableWrapper" border stripe :loading="listLoading" :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle">

      <el-table-column type="index" label="序号" width="55" align="center" />

      <el-table-column prop="name" label="缓存名称" min-width="120" />

      <el-table-column label="操作" width="80" align="center">
        <template slot-scope="scope">
          <el-link :underline="false" type="primary" @click="handleClearCache(scope.row)">
            清除
          </el-link>
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

  </div>
</template>
<script>
export default {
  components: {},

  data() {
    return {
      // 分页
      pageNum: 1,
      pageSize: 20,
      total: 0,

      listLoading: false,
      tableData: []
    }
  },
  activated() {},
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.$http({
        url: '/api/sys/v1/sys/redis/',
        method: 'get'
      }).then((res) => {
        const arr = []
        Object.keys(res.data).map((key) => {
          arr.push({
            key: key,
            name: res.data[key]
          })
        })
        this.tableData = arr
      })
    },
    // 清除
    handleClearCache(row) {
      this.$http({
        url: '/api/sys/v1/sys/redis/?keyArr=' + row.name,
        method: 'delete'
      })
        .then((res) => {
          if (res.code === 1) {
            this.getList()
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 清空
    handleClearAll() {
      this.$http({
        url: '/api/sys/v1/sys/redis/all',
        method: 'delete'
      })
        .then((res) => {
          if (res.code === 1) {
            this.getList()
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    handleChangePageSize(val) {
      this.pageSize = val
      this.pageNum = 1
      this.getList()
    },
    handleChangePage(val) {
      this.pageNum = val
      this.getList()
    }
  }
}
</script>
