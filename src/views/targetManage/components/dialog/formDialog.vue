<template>
  <el-dialog :title="addOrEdit | formatTitle" width="58rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">

    <el-form ref="form" :model="formData" :rules="rules" label-width="6rem" inline>

      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择" clearable :disabled="addOrEdit!==0">
          <el-option label="指标分类" value="0" />
          <el-option label="一级指标" value="1" />
          <el-option label="二级指标" value="2" />
          <el-option label="分级内容" value="3" />
        </el-select>
      </el-form-item>

      <el-form-item :label="formData.type==='0' ? '分类名称' : '指标内容'" prop="gradedName">
        <el-input v-model="formData.gradedName" placeholder="请输入" maxlength="200" clearable />
      </el-form-item>

      <el-form-item label="父级" prop="parentId">
        <el-cascader v-model="formData.parentId" :options="treeList"
                     :props="{label: 'gradedName', value: 'id', checkStrictly: true , emitPath:false}"
                     :show-all-levels="false" clearable :disabled="disableParentId" />
      </el-form-item>

      <el-form-item v-if="formData.type === '3'" label="分值范围">
        <el-input v-model="formData.fractionRange" placeholder="请输入分值范围(格式为：最低分~最高分)" maxlength="10" clearable />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入" maxlength="10" clearable />
      </el-form-item>

    </el-form>
    <!--  分级内容批量新增  -->

    <div v-if="showTableList" class="table-container">

      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe :data="tableData" height="280">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="gradedName" label="分级内容" min-width="300">
          <template v-slot="scope">
            <el-input v-model="scope.row.gradedName" size="small" maxlength="200" clearable placeholder="分级内容" style="width: 100%" />
          </template>
        </el-table-column>

        <el-table-column prop="fractionRange" label="分值范围" min-width="200">
          <template v-slot="scope">
            <el-input v-model="scope.row.fractionRange" size="small" maxlength="20" clearable
                      placeholder="分值范围(最低分~最高分)" style="width: 100%" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center">
          <template v-slot="scope">
            <el-popconfirm title="确定要删除吗?" @confirm="()=>inlineDelete(scope.$index)">
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
      <div class="table-add-btn" @click="handleInlineCreate">
        <el-link icon="el-icon-plus" type="primary" :underline="false">新增分级内容</el-link>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { validNumberGt0 } from '@/utils/validate'

export default {
  name: 'TargetFormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新增'
      } else if (val === 1) {
        return '编辑'
      } else {
        return '查看'
      }
    }
  },

  props: {
    treeList: {
      type: Array,
      required: true
    },
    formData: {
      required: true,
      type: Object
    },
    isShow: {
      type: Boolean,
      default: false
    },
    addOrEdit: {
      type: Number,
      default: 0
    }

  },
  data() {
    return {
      uri: '/api/scl/v1/scl/sclOutcomeIndex/',
      tableLoading: false,
      tableData: [],
      query: {
        pageSize: -1,
        pageNum: -1
      },

      rules: {
        gradedName: [{ required: true, message: '请输入指标内容', trigger: 'blur' }],
        factor: [{ required: true, message: '请输入权重系数', trigger: 'blur' }],
        sort: [{ required: validNumberGt0, trigger: 'blur' }]
      },

      disableParentId: false

    }
  },
  computed: {
    // 分级内容批量修改
    showTableList() {
      return this.addOrEdit === 1 && this.formData.type !== '0' && this.formData.type !== '3'
    },
    roadRiskLevel() {
      return this.$store.state.dict.roadRiskLevel
    }
  },
  methods: {
    // 表格行内编辑 - 新增一行空数据
    handleInlineCreate() {
      this.tableData.push({
        sort: this.tableData.length + 1,
        indexClassification: this.formData.indexClassification,
        parentId: this.formData.id,
        type: '3'
      })
      this.$nextTick(() => {
        this.$refs['tableWrapper'].doLayout()
      })
    },
    // 表格行内删除
    inlineDelete(index) {
      this.tableData.splice(index, 1)
    },

    // 查询分级内容列表
    getList() {
      this.tableLoading = true

      const params = {
        ...this.query
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

    handleOpen() {
      if (this.addOrEdit === 1) {
        this.query.parentId = this.formData.id
        // this.query.type = '3'
        this.getList()
      }

      this.disableParentId = !!this.formData.parentId

      this.$nextTick(() => {
        // 弹窗打开，清除表单校验
        this.$refs['form']?.clearValidate()
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    },
    // 保存或新增项目节点
    handleConfirm() {
        this.$refs['form']?.validate((valid) => {
          if (valid) {
            const para = { ...this.formData }
            if (this.addOrEdit === 0) {
              this.$emit('addFormData', para)
            } else {
              if (this.showTableList && this.tableData.length) {
                // 先批量保存分级内容列表
                this.$http({
                  url: '/api/scl/v1/scl/sclOutcomeIndex/saveBatch?parentId=' + this.formData.id,
                  method: 'post',
                  data: this.tableData
                }).then(res => {
                  if (res?.code === 1) {
                    // this.$message.success('保存成功')
                    // this.$emit('closeDialog', 1)

                    this.$emit('editFormData', para)
                  }
                })
              } else {
                this.$emit('editFormData', para)
              }
            }
          } else {
            return this.$message({
              type: 'warning',
              message: '表单校验失败, 请检查输入!'
            })
          }
        })
    }
  }

}
</script>

<style scoped lang="scss">
.el-cascader,
.el-select,
.el-input {
  width: 20rem;
}

.table-add-btn{
  border: 1px solid #EAEDF1;
  border-top: 0;
  padding: 0.5rem 1rem;
  text-align: center;

  cursor: pointer;
}
</style>
