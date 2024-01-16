/**
 * 表格基本 CURD 的封装
 * 在表格组件中混入即可使用
 */
import qs from 'qs'
export default {
  data() {
    return {
      // uri: {
      //   list: '',
      //   add: '',
      //   edit: '',
      //   del: '',
      //   delBatch: '',
      // },
      // uri: '',
      // 检索表单
      query: {},
      // 排序
      sortField: 'createDate',
      sortOrder: 'descend',

      tableKey: 1,
      tableLoading: false,
      tableData: [],
      multipleSelection: [],
      // 批量删除时，参数名称
      deleteAllId: '',

      // 分页
      // 若不分页 pageSize:-1, pageNum:-1
      pageNum: 1,
      pageSize: 10,
      total: 0,
      pageSizeList: [5, 10, 25, 50, 100],

      // 弹窗相关
      formData: {},
      addOrEdit: 0,
      dialogVisible: false,

      // el-table设置的 ref，默认为 tableWrapper
      tableRef: 'tableWrapper',

      // 挂载时是否混入此mixin的mounted函数
      curdMountedMixin: true
    }
  },
  mounted() {
    if (this.curdMountedMixin) {
      this.getList()
    }
  },
  methods: {
    // 条件查询
    handleQuery() {
      this.pageNum = 1
      this.getList()
    },
    // 清空查询条件
    handleClearQuery() {
      for (const key in this.query) {
        if (Object.hasOwnProperty.call(this.query, key)) {
          this.query[key] = ''
        }
      }
      this.handleQuery()
    },
    // 获取列表-分页查询
    getList() {
      this.tableLoading = true

      const params = {
        ...this.query,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        // projectId: sessionStorage.getItem('projectId'),
        sortField: this.sortField,
        sortOrder: this.sortOrder
      }

      this.$http({
        url: this.uri.list || this.uri,
        method: 'get',
        params
      }).then((res) => {
        this.tableData = res.data?.dataList || res.data || []
        this.total = res.data.total
        this.$nextTick(() => {
          this.$refs[this.tableRef] && this.$refs[this.tableRef].doLayout()
        })
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 表格行内编辑 - 新增一行空数据
    handleInlineCreate() {
      this.tableData.push({})
    },
    // 表格行内删除
    inlineDelete(index) {
      this.tableData.splice(index, 1)
    },
    // 新增
    handleCreate() {
      this.formData = {}
      this.addOrEdit = 0
      this.dialogVisible = true
    },
    /**
     * 新增表单
     * @param form 表单数据
     * @param cb 新增成功后的回调，参数默认为接口返回结果的 data
     */
    addFormData(form, cb) {
      this.$http({
        url: this.uri.add || this.uri,
        method: 'post',
        data: form
      }).then(res => {
        if (res?.code === 1) {
          this.$message.success('保存成功！')
          this.handleQuery()
          this.dialogVisible = false

          cb && cb(res.data)
        }
      })
    },

    // 单条数据编辑
    handleEdit(row) {
      this.formData = { ...row }
      this.addOrEdit = 1
      this.dialogVisible = true
    },
    /**
     * 修改表单
     * @param form 表单数据
     * @param cb 修改成功后的回调，参数默认为接口返回结果的 data
     */
    editFormData(form, cb) {
      this.$http({
        url: this.uri.edit || this.uri,
        method: 'put',
        data: form
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('保存成功！')
          this.getList()
          this.dialogVisible = false

          cb && cb(res.data)
        }
      })
    },
    // 单条数据查看
    handleView(row) {
      this.formData = { ...row }
      this.addOrEdit = 2
      this.dialogVisible = true
    },
    /**
     * 关闭弹窗
     * @param refresh 是否刷新列表
     */
    handleCloseDialog(refresh) {
      if (refresh) {
        this.getList()
      }
      this.dialogVisible = false
    },

    // 单条数据删除
    handleDelete(id) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.delFormData(id)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作已取消'
          })
        })
    },
    delFormData(id) {
      this.$http({
        url: (this.uri.del || this.uri) + id,
        method: 'delete'
      }).then((res) => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          this.handleQuery()
        }
      })
    },

    // 勾选选中行改变
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 批量删除
    handleDeleteBatch() {
      if (Array.isArray(this.tableData) && this.tableData.length === 0) {
        return this.$message.warning('列表暂无数据')
      }
      if (
        !this.multipleSelection || !Array.isArray(this.multipleSelection) ||
        this.multipleSelection.length === 0 || JSON.stringify(this.multipleSelection) === '{}'
      ) {
        return this.$message.warning('请先选择要删除的数据!')
      }
      this.$confirm('此操作将永久删除这些数据, 是否继续?', '提示', {
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
                this.$refs[this.tableRef] && this.$refs[this.tableRef].clearSelection()
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

    // 刷新
    handleRefresh() {
      this.pageNum = 1
      this.getList()
    },

    // 表格排序
    handleTableSort({ prop, order }) {
      if (order === null) {
        // 还原
        this.sortField = 'sort'
        this.sortOrder = 'ascend'
        this.handleQuery()
        return
      }
      this.sortField = prop
      this.sortOrder = order === 'ascending' ? 'ascend' : 'descend'
      this.handleQuery()
    },

    // 当前页改变
    handleChangePage(val) {
      this.pageNum = val
      this.getList()
    },
    // 每页显示条数改变
    handleChangePageSize(val) {
      this.pageSize = val
      this.handleQuery()
    }

  }
}
