<template>
  <div v-loading="listLoading" class="risk-info">

    <!--  一级  -->
    <div v-for="level1 in treeList" :key="level1.id" class="flex level-1">
      <div class="text-vertical">{{ level1.gradedName }}</div>

      <!--  二级  -->
      <div class="flex-column" style="flex: 1">
        <div v-for="level2 in level1.children" :key="level2.id" class="flex level-2">
          <div class="text-vertical">{{ level2.gradedName }}</div>

          <!--  三级  -->
          <div v-if="level2.children&&level2.children.findIndex(i=>i.type==='2')!==-1" class="flex-column" style="flex: 1">
            <div v-for="(level3,index3) in level2.children" :key="level3.id" class="flex level-3"
                 :class="{'no-border-top':index3===0,'same-level2':level3.gradedName === level2.gradedName}">

              <div class="text-vertical">{{ level3.gradedName }}</div>
              <!--  四级  -->
              <div class="level-4">
                <div class="radio-group">
                  <el-radio-group v-model="level3.fractionRange">
                    <el-radio v-for="item in level3.children" :key="item.id" :label="item.fractionRange">{{ item.gradedName }}</el-radio>
                  </el-radio-group>
                </div>
                <div class="score">
                  <span>推荐分数</span> <span style="color:#3EB973; font-size: 16px">
                    {{ level3.fractionRange }}
                  </span>
                </div>
                <div class="evaluate">
                  <!--  评价对3级指标打分  -->
                  <span>评价分数</span>
                  <el-input v-model="level3.fraction" placeholder="请输入" @change="()=>{changeFraction(level3)}" />
                </div>
              </div>

            </div>
          </div>

          <div v-else class="level-col" style="flex: 1">
            <!--  四级  -->
            <div class="level-4">
              <div class="radio-group">
                <el-radio-group v-model="level2.fractionRange">
                  <el-radio v-for="item in level2.children" :key="item.id" :label="item.fractionRange">{{ item.gradedName }}</el-radio>
                </el-radio-group>
              </div>
              <div class="score">
                <span>推荐分数</span> <span style="color:#3EB973; font-size: 16px">
                  {{ level2.fractionRange }}
                </span>
              </div>
              <div class="evaluate">
                <!--  评价对3级指标打分  -->
                <span>评价分数</span>
                <el-input v-model="level2.fraction" placeholder="请输入" @change="()=>{changeFraction(level2)}" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>

</template>

<script>
import qs from 'qs'
/**
 * 风险评估打分表
 */
export default {
  name: 'EvaluateTable',
  props: {
    // 指标类型： '可能性指标' ; '后果指标'
    indexClassification: {
      type: String,
      required: true
    },
    // 道路风险评估ID
    locationTaskId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      listLoading: false,
      treeList: []
    }
  },
  watch: {
    locationTaskId: {
      handler: function() {
        this.getTreeList()
      },
      immediate: true
    }
  },
  mounted() {
    // this.getTreeList()
  },
  methods: {
    // 分数改变，校验
    changeFraction(node) {
      if (node.fractionRange) {
        const arr = node.fractionRange.split('~')
        console.log(arr)
        if (Number(node.fraction) > Number(arr[1]) || node.fraction < Number(arr[0])) {
          this.$message.warning('请输入推荐范围内的分值')
          node.fraction = ''
        }
      }
    },
    // 保存评分
    saveEvaluation(cb) {
      const loading = this.$loading({
        lock: true,
        text: '正在保存，请稍候...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      // 获取三级节点评价分数 批量保存
      const sclLocationOutcomes = []
      const selectIds = []
      this.treeList.map(item => {
        this.getListAtLevel(item, sclLocationOutcomes, selectIds)
      })
      // console.log(sclLocationOutcomes, selectIds)

      // 保存选中的分级内容ID
      const api1 = this.$http({
        url: '/api/scl/v1/scl/sclLocationOutcome/selectFlag',
        method: 'get',
        params: {
          locationTaskId: this.locationTaskId,
          selectIds
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false })
        }
      })
      // 批量修改或保存指标评分
      const api2 = this.$http({
        url: '/api/scl/v1/scl/sclLocationOutcome/updateBatch',
        method: 'put',
        data: sclLocationOutcomes
      })

      Promise.all([api1, api2]).then(resArr => {
        if (resArr.filter(res => res?.code === 1).length === resArr.length) {
          this.$message.success('保存成功！')
        }
        loading.close()
        cb && cb()
      }).catch(() => {
        loading.close()
      })

      // this.$http({
      //   url: '/api/scl/v1/scl/sclLocationOutcome/updateBatch',
      //   method: 'put',
      //   data: sclLocationOutcomes
      // }).then(res => {
      //   if (res.code === 1) {
      //     this.$message.success('保存成功！')
      //   }
      //
      //   loading.close()
      //   cb && cb()
      // }).catch(() => {
      //   loading.close()
      // })
    },

    getListAtLevel(treeNode, arr, selectIds) {
      if (treeNode.type === '1' || treeNode.type === '2') {
        arr.push({
          id: treeNode.id,
          type: treeNode.type,
          fractionRange: treeNode.fractionRange,
          fraction: treeNode.fraction,
          factor: treeNode.factor
        })
        const temp = treeNode.children.find(i => i.type === '3' && i.fractionRange === treeNode.fractionRange)
        if (temp?.id) {
          selectIds.push(temp.id)
        }
      }

      treeNode.children?.map(childNode => {
        this.getListAtLevel(childNode, arr, selectIds)
      })
    },

    // 获取指标评分树
    getTreeList() {
      if (!this.locationTaskId) {
        return
      }
      this.listLoading = true
      const params = {
        locationTaskId: this.locationTaskId,
        indexClassification: this.indexClassification
      }
      this.$http({
        url: '/api/scl/v1/scl/sclLocationOutcome/tree',
        method: 'get',
        params
      }).then((res) => {
        this.treeList = res.data
      }).finally(() => {
        this.listLoading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.text-vertical{
  //vertical-align: middle;
  //text-align: center;
  //writing-mode: vertical-rl;
  //text-orientation: upright;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  //height: 200px; /* 设置容器的高度 */
  writing-mode: vertical-rl; /* 设置文字的竖排方向 */
  text-orientation: upright; /* 设置文字的方向为正常方向 */

}

.risk-info {
  min-height: 10rem;
  border-left: 1px solid #4279E4;
  border-top: 1px solid  #EAEDF1;
  //border-right: 1px solid  #EAEDF1;
  border-bottom: 1px solid  #EAEDF1;
  width: calc(100% - 32px);
  margin: 16px;

  // 第一行边框
  & .no-border-top{
    border-top: none !important;
  }

  .level-1 {

    //background-color: #3b87d5;
    background: #E5F1FF;

    & .text-vertical {
     width: 4rem;
      //padding: 1rem;
    }
  }

  .level-2 {
    background: #E9F4FD;
    border-left: 1px solid #EAEDF1;
    border-right: 1px solid #EAEDF1;

    & .text-vertical {
      width: 3rem;
      //padding: 1rem;
    }
    &:has(.level-col){
      border-top: 1px solid #EAEDF1;
      .text-vertical{
        width: 6rem;
        //padding: 2.6rem;
      }

      &:nth-child(odd) .level-4 {
        background-color: #F4F5F7;
      }

      .level-3{
        border-top: 0;
      }
    }
  }

  .level-3 {
    background: #F1F6FA;
    border-top: 1px solid #EAEDF1;

    & .text-vertical {
      padding: 1rem;
    }

    &:nth-child(odd) .level-4 {
      background-color: #F4F5F7;
    }

    & .same-level2 {
      background: #E9F4FD;
    }
  }

  .level-4 {
    flex: 1;
    background: #fff;
    display: flex;
    //border-top: 1px solid  #EAEDF1;

    & > div {
      //width: 30%;
      padding: 2rem;
      //vertical-align: middle;
      border-left: 1px solid #EAEDF1;
    }

    .radio-group {
      width: 50%;
    }

    .score,
    .evaluate {
      width: 25%;
      display: flex;
      align-items: center;

      span {
        width: 6rem;
        //margin-right: 1rem;
      }

      .el-input {
        width: 8rem;
      }
    }
  }
}

::v-deep.el-radio-group {
  display: flex;
  flex-direction: column;

  .el-radio {
    margin-top: 0.75rem;
    display: flex;
    line-height: 1.1rem;
    white-space: break-spaces;
  }
}
</style>
