<template>
  <div class="app-container">
    <!-- 列表查询搜索框 -->
    <el-form :model="query" inline label-width="6rem" class="query-form">

      <el-form-item label="指标内容">
        <el-input v-model="query.gradedName" />
      </el-form-item>

      <el-form-item label=" " label-width="2rem">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleClearQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-container">
      <!-- 列表操作按钮 -->
      <div class="table-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          新增类别
        </el-button>
        <el-button type="primary" plain icon="el-icon-delete" @click="handleDeleteBatch">
          批量删除
        </el-button>
      </div>
      <!-- 列表 -->
      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe :row-key="(row)=>{return row.id}" :data="tableData"
                :default-expand-all="true"
                :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" :reserve-selection="true" align="center" />
        <!--        <el-table-column label="序号" width="60" align="center">-->
        <!--          <template v-slot="scope">-->
        <!--            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column prop="gradedName" label="指标内容" min-width="300" />
        <!--        <el-table-column prop="fractionRange" label="分值范围" min-width="100" />-->
        <!--        <el-table-column prop="factor" label="权重系数" min-width="100" />-->

        <!--        <el-table-column prop="indexClassification" label="指标类型" min-width="100" />-->
        <el-table-column prop="type" label="指标分类" min-width="100">
          <template v-slot="scope">
            {{ typeList[scope.row.type] }}
          </template>
        </el-table-column>
        <!--        <el-table-column prop="level" label="层级" width="50" />-->
        <!--        <el-table-column prop="remarks" label="备注" min-width="100" show-overflow-tooltip />-->

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template v-slot="scope">
            <template v-if="['0','1'].indexOf(scope.row.type)!==-1">
              <el-link type="primary" :underline="false" @click="handleAddChild(scope.row)">
                新增下级
              </el-link>
              <el-divider direction="vertical" />
            </template>

            <!--            <template v-if="['1','2'].indexOf(scope.row.type)!==-1">-->
            <!--              <el-link type="primary" :underline="false" @click="handleAddChild(scope.row)">-->
            <!--                分级内容-->
            <!--              </el-link>-->
            <!--              <el-divider direction="vertical" />-->
            <!--            </template>-->

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
    </div>
    <!-- 表单编辑弹窗 -->
    <form-dialog :is-show="dialogVisible" :add-or-edit="addOrEdit" :form-data="formData" :tree-list="tableData"
                 @closeDialog="handleCloseDialog" @addFormData="addFormData" @editFormData="editFormData" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import FormDialog from './dialog/formDialog.vue'
/**
 * 指标管理
 */
export default {
  name: 'TargetManageList',
  components: {
    FormDialog
  },
  mixins: [BaseCurd],
  props: {
    indexClassification: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      uri: {
        list: '/api/scl/v1/scl/sclOutcomeIndex/tree',
        add: '/api/scl/v1/scl/sclOutcomeIndex/',
        edit: '/api/scl/v1/scl/sclOutcomeIndex/',
        del: '/api/scl/v1/scl/sclOutcomeIndex/'
      },

      deleteAllId: 'sclOutcomeIndexIds',
      pageSize: -1,
      pageNum: -1,

      query: {
        indexClassification: '可能性指标',
        unType: '3'
      },

      // 默认展开的树节点id
      expandKeys: [],

      typeList: ['指标分类', '一级指标', '二级指标', '分级内容']
    }
  },
  watch: {
    // tableData: {
    //   handler: function() {
    //     this.expandKeys = []
    //     this.getExpandKeys(this.tableData, this.expandKeys)
    //     console.log(this.expandKeys)
    //   },
    //   immediate: true
    //
    // }
  },
  created() {
    this.query.indexClassification = this.indexClassification
  },
  mounted() {},
  methods: {
    getExpandKeys(tree, arr) {
      tree.map(i => {
        if (i.level < 3) {
          arr.push(i.id)

          if (i.children && i.children.length) {
            this.getExpandKeys(i.children, arr)
          }
        }
      })
    },
    // 新建
    handleCreate() {
      // 设置默认值
      this.formData = {
        type: '0', // 新增类别
        indexClassification: this.indexClassification
      }
      this.addOrEdit = 0
      this.dialogVisible = true
    },
    // 新增下级节点
    handleAddChild(row) {
      this.formData = {
        parentId: row.id,
        indexClassification: this.indexClassification,
        type: (parseInt(row.type) + 1).toString()
      }
      this.addOrEdit = 0
      this.dialogVisible = true
    }
  }
}
</script>
<style scoped lang="scss">

</style>
