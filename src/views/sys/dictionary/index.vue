<template>
  <div class="app-container">
    <div slot="header">
      <el-form label-width="60px" inline>
        <el-form-item label="类型">
          <el-input v-model="query.type" clearable />
        </el-form-item>
        <el-form-item label=" " label-width="15px">
          <el-button type="primary" icon="el-icon-search">查 询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleCreateDictType">新 建</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="content-box">
      <div class="left-box">
        <el-table ref="tableWrapper" v-loading="tableLoading" :data="tableData" border highlight-current-row
                  :header-cell-style="$store.state.settings.tableHeaderStyle"
                  @current-change="handleCurrentRowChange">
          <el-table-column type="index" label="序号" width="55" />
          <el-table-column prop="type" label="类型" min-width="150" />
          <el-table-column prop="description" label="描述" min-width="150" />
          <el-table-column prop="createDate" label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-link :underline="false" icon="el-icon-edit" type="primary" circle @click="handleEditDictType(scope.row)" />
              <el-link :underline="false" icon="el-icon-delete" type="danger" circle @click="handleDelDictType(scope.row.id)" />
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

      <div class="right-box">
        <el-card>
          <template v-if="!currentDict">
            <el-empty description="暂无数据" :image-size="200" />
          </template>
          <template v-else>
            <div class="label-item">
              <span class="dot" /><span class="title">类型: </span>
              <span class="val">{{ currentDict.type }}</span>
            </div>
            <div class="label-item">
              <span class="dot" /><span class="title">描述: </span>
              <span class="val">{{ currentDict.description }}</span>
            </div>
            <el-divider />
            <div class="btns">
              <el-button size="small" type="primary" plain icon="el-icon-plus" @click="handleCreateDictVal">新 建</el-button>
              <el-button size="small" type="success" plain icon="el-icon-refresh">刷 新</el-button>
            </div>

            <div class="dict-items">
              <div v-for="dict in dictChildrenList" :key="dict.id" class="item">
                <div class="dict-title">
                  <span>{{ dict.type }}</span>
                  <span>
                    <el-button size="small" type="primary" plain icon="el-icon-edit" @click="handleEditChildDict(dict)">编辑</el-button>
                    <el-button size="small" type="danger" plain icon="el-icon-delete" @click="handleDelDictType(dict.id)">删 除</el-button>
                  </span>
                </div>
                <div class="label-item">
                  <span class="title">键值: </span><span class="val">{{ dict.value }}</span>
                </div>
                <div class="label-item">
                  <span class="title">标签: </span><span class="val">{{ dict.label }}</span>
                </div>
                <div class="label-item">
                  <span class="title">排序: </span><span class="val">{{ dict.sort }}</span>
                </div>
              </div>
            </div>
          </template>

        </el-card>
      </div>
    </div>

    <DictParentFormDialog :dialog-visible="parentDialogVisible" :form-data="formData" :add-or-edit="addOrEdit"
                          @closeDialog="handleParentDialogClose" />

    <DictChildrenFormDialog :dialog-visible="childDialogVisible" :form-data="formData" :add-or-edit="addOrEdit"
                            @closeDialog="handleChildDialogClose" />
  </div>
</template>

<script>
import DictChildrenFormDialog from './dialog/dictChildrenFormDialog.vue'
import DictParentFormDialog from './dialog/dictParentFormDialog.vue'
import * as dict from '@/api/sys/dict'

export default {
  components: {
    DictChildrenFormDialog,
    DictParentFormDialog
  },

  data() {
    return {
      query: {},
      tableLoading: false,
      tableData: [],

      dictParentList: [],
      dictChildrenList: [],

      currentDict: null,
      // 分页
      pageNum: 1,
      pageSize: 20,
      total: 0,

      formData: {},
      addOrEdit: 0, // 0-新增；1-编辑
      childDialogVisible: false,
      parentDialogVisible: false
    }
  },
  mounted() {
    this.getParentList()
  },
  methods: {
    // 新增字典类型
    handleCreateDictType() {
      this.addOrEdit = 0
      this.formData = {
        type: '',
        description: ''
      }
      this.parentDialogVisible = true
    },
    // 编辑字典类型
    handleEditDictType(row) {
      this.addOrEdit = 1
      this.formData = {
        id: row.id,
        type: row.type,
        description: row.description
      }
      this.parentDialogVisible = true
    },
    // 删除字典类型
    handleDelDictType(id) {
      this.$confirm('此操作将永久删除该数据, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          dict.delDict(id).then((res) => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getChildrenList()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    // 新增字典键值
    handleCreateDictVal() {
      this.addOrEdit = 0
      this.formData = {
        parentId: this.currentDict.id,
        type: this.currentDict.type,
        value: '',
        label: '',
        sort: ''
      }
      this.childDialogVisible = true
    },
    // 编辑字典键值
    handleEditChildDict(dict) {
      this.addOrEdit = 1
      this.formData = {
        id: dict.id,
        parentId: dict.parentId,
        type: dict.type,
        value: dict.value,
        label: dict.label,
        sort: dict.sort
      }
      this.childDialogVisible = true
    },

    // 关闭弹窗
    handleParentDialogClose(refresh) {
      if (refresh === 1) {
        this.getParentList()
      }
      this.parentDialogVisible = false
    },
    // 关闭弹窗
    handleChildDialogClose(refresh) {
      if (refresh === 1) {
        this.getChildrenList()
      }
      this.childDialogVisible = false
    },
    // 表格选中行
    handleCurrentRowChange(val) {
      this.currentDict = val
      if (
        this.currentDict === null ||
        this.currentDict === undefined ||
        this.currentDict === '' ||
        JSON.stringify(this.currentDict) === '{}'
      ) {
        return (this.currentDict = null)
      }
      this.$nextTick(() => {
        this.getChildrenList()
      })
    },
    // 获取父级字典列表
    getParentList() {
      this.tableData = []
      this.tableLoading = true
      let para = {
        pageSize: this.pageSize,
        pageNum: this.pageNum
      }
      para = Object.assign(para, this.query)
      dict
        .getParentList(para)
        .then((res) => {
          if (res.code === 1) {
            this.tableData = res.data.dataList
            this.total = res.data.total
          }
          this.tableLoading = false
        })
        .catch((err) => {
          console.log(err)
          this.tableLoading = false
        })
    },
    // 根据父级ID获取子级字典列表
    getChildrenList() {
      if (!this.currentDict.id) {
        return this.$message.warning('请先选择字典类型!')
      }
      const para = {
        parentId: this.currentDict.id
      }
      dict
        .getChildrenList(para)
        .then((res) => {
          if (res.code === 1) {
            this.dictChildrenList = res.data
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    handleChangePageSize(val) {
      this.pageSize = val
      this.getParentList()
    },
    handleChangePage(val) {
      this.pageNum = val
      this.getParentList()
    }
  }
}
</script>

<style lang="scss" scoped>
.content-box {
  display: flex;
  justify-content: space-between;

  height: calc(100% - 60px);

  .left-box {
    width: 600px;
    margin-right: 30px;
  }

  .right-box {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
    .label-item {
      display: flex;
      align-items: center;
      span {
        display: inline-block;
        height: 30px;
        line-height: 30px;
      }

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #fa8c16;
        margin-right: 8px;
      }
      .title {
        width: 3rem;
        color: #666;
        margin-right: 15px;
      }

      .val {
        width: 28rem;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    .dict-items {
      display: flex;
      flex-wrap: wrap;

      .item {
        width: 45%;
        min-width: 450px;
        border: 1px solid #eee;
        margin-top: 15px;
        margin-right: 30px;
        border-radius: 4px;
        .dict-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          padding-left: 0;
          border-bottom: 1px solid #eee;

          & > span:nth-child(1) {
            height: 24px;
            line-height: 24px;
            border-left: 5px solid #ccc;
            padding-left: 5px;

            font-weight: bold;
          }
        }

        .label-item {
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
