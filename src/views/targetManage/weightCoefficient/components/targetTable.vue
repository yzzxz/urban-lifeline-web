<template>
  <div class="container">
    <div class="title">
      风险发生{{ indexClassification }}体系
    </div>

    <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
              :header-cell-style="$store.state.settings.tableHeaderStyle" :default-expand-all="true">

      <el-table-column prop="gradedName" label="评价指标项" min-width="300" />
      <el-table-column prop="sort" label="重要性排序" min-width="100" />
      <!--      <el-table-column prop="level" label="" min-width="100" />-->
      <el-table-column prop="factor" label="权重系数" min-width="100">
        <template v-slot="scope">
          <div v-if="scope.row.editStatus" class="flex">
            <el-input v-model="scope.row.factor" size="small" placeholder="请输入权重系数" />

            <el-button size="small" type="primary" style="margin-left: 1rem" @click="handleSaveRow(scope.row)">保存</el-button>
            <el-button size="small" type="primary" plain style="margin-left: 1rem" @click="handleEditRow(scope.row,false)">取消</el-button>
          </div>
          <div v-else>
            {{ scope.row.factor }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template v-slot="scope">
          <el-link type="primary" :underline="false" @click="handleEditRow(scope.row)">
            编辑
          </el-link>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty :image-size="80" />
      </template>
    </el-table>

  </div>
</template>

<script>
import BaseCurd from '@/mixin/BaseCurd'

/**
 * 指标权重系数管理
 */
export default {
  name: 'PossibilityTarget',
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
        list: '/api/scl/v1/scl/sclOutcomeIndex/',
        add: '/api/scl/v1/scl/sclOutcomeIndex/',
        edit: '/api/scl/v1/scl/sclOutcomeIndex/'
      },
      query: {
        indexClassification: '可能性指标',
        type: '1'
      },
      sortField: 'sort',
      sortOrder: 'ascend',
      pageSize: -1,
      pageNum: -1
    }
  },
  created() {
    this.query.indexClassification = this.indexClassification
  },
  methods: {
    // 行内数据保存
    handleSaveRow(row) {
      const para = {
        id: row.id,
        factor: row.factor
      }
      this.editFormData(para)
    },

    // 行内数据编辑
    handleEditRow(row, status = true) {
      this.$set(row, 'editStatus', status)
    }
  }
}
</script>

<style scoped lang="scss">

.container{
  padding: 12px 16px;
}
.title{
  height: 3rem;
  line-height: 3rem;
  font-size: 16px;
  color: #303133;
  font-weight: 600;

  margin-bottom: 0.5rem;

  &::before{
    content: '';
    display: inline-block;
    width:4px;
    height: 14px;
    background-color: #4279E4;

    margin-right: 0.5rem;
  }
}
</style>
