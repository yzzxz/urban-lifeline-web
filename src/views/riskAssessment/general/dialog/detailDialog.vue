<template>
  <el-dialog :title="`风险总体评估${indexClassification}体系表`" width="110rem" top="2rem" append-to-body :close-on-click-modal="true" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <div class="table-container">

      <div class="table-header">
        <div>评价指标</div>
        <div class="radio-group">分级内容(分值范围)</div>
        <div class="score">取值</div>
        <div class="score">权重系数</div>
        <div class="score">评价分值</div>
        <div class="col">{{ indexClassification.replace('指标', '评分') }}</div>
        <div class="col">{{ indexClassification.replace('指标', '等级') }}</div>
      </div>

      <div style="display: flex;box-sizing: border-box;width: 100%;overflow: hidden">

        <div class="table-content">
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
                        <el-radio-group v-model="level3.fractionRange" disabled>
                          <el-radio v-for="item in level3.children" :key="item.id" :label="item.fractionRange">
                            {{ item.gradedName }}  <span> ({{ item.fractionRange }})</span>
                          </el-radio>
                        </el-radio-group>
                      </div>
                      <div class="score">
                        <!--  取值  -->
                        <span>{{ level3.fraction }}</span>
                      </div>
                      <div class="score">
                        <!--  权重  -->
                        <span>{{ level2.factor }}</span>
                      </div>
                      <div class="score">
                        <!--  评价分值  -->
                        <span>{{ level2.afterFraction }}</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div v-else class="level-col" style="flex: 1">
                  <!--  四级  -->
                  <div class="level-4">
                    <div class="radio-group">
                      <el-radio-group v-model="level2.fractionRange" disabled>
                        <el-radio v-for="item in level2.children" :key="item.id" :label="item.fractionRange">
                          {{ item.gradedName }} <span> ({{ item.fractionRange }})</span>
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <div class="score">
                      <!--  取值  -->
                      <span>{{ level2.fraction }}</span>
                    </div>
                    <div class="score">
                      <!--  权重  -->
                      <span>{{ level2.factor }}</span>
                    </div>
                    <div class="score">
                      <!--  评价分值  -->
                      <span>{{ level2.afterFraction }}</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>

        <template v-if="indexClassification==='后果指标'">
          <div class="score col">{{ formData.consequenceAssessment }}</div>
          <div class="score col">{{ formData.consequenceAssessmentLevel }}</div>
        </template>

        <template v-if="indexClassification==='可能性指标'">
          <div class="score col">{{ formData.possibilityEvaluation }}</div>
          <div class="score col">{{ formData.possibilityEvaluationLevel }}</div>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<script>

export default {
  name: 'ScoreDetailDialog',

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      required: true
    },

    indexClassification: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      treeList: []
    }
  },
  computed: {

  },
  methods: {
    handleOpen() {
      this.$nextTick(() => {
        this.getTableData()
      })
    },

    getTableData() {
      this.$http({
        url: '/api/scl/v1/scl/sclLocationOutcome/tree',
        method: 'get',
        params: {
          indexClassification: this.indexClassification,
          locationTaskId: this.formData.id
        }
      }).then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    }

  }
}
</script>

<style scoped lang="scss">
.text-vertical{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.table-container {
  margin: auto;
  width: 100rem;
  border-right: 1px solid  #EAEDF1;
  color: #1A1A1A;
  .radio-group {
    width: 50rem;
    padding: 1rem;
  }
  .score{
    width: 8rem;
    min-width: 8rem;

    display: flex;
    align-items: center;
    justify-content: center;

    &.col{
      border-top: 1px solid  #EAEDF1;
      border-right: 1px solid  #EAEDF1;
      border-bottom: 1px solid  #EAEDF1;

      color: #3EB973;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .table-header{
    width: 100%;
    border-top: 1px solid #4279E4;
    background-color: #F3F8FC;
    //display: flex;
    overflow: hidden;
    white-space: nowrap;

    div{
      display: inline-block;
      text-align: center;
      padding: 1rem 0;

      border-left: 1px solid #EAEDF1;
    }

    div:nth-child(1){
      width: calc(10rem + 3px);
    }

    .col{
      width: 8rem;
    }
  }

  .table-content{
    min-height: 10rem;

    border-top: 1px solid  #EAEDF1;
    border-left: 1px solid  #EAEDF1;

    border-bottom: 1px solid  #EAEDF1;

    // 第一行边框
    & .no-border-top{
      border-top: none !important;
    }

    .level-1 {

      & .text-vertical {
        width: 4rem;
        min-width: 4rem;
      }
    }

    .level-2 {

      border-left: 1px solid #EAEDF1;
      border-right: 1px solid #EAEDF1;

      & .text-vertical {
        width: 3rem;
        min-width: 3rem;
      }

      &>.flex-column{
        border-left: 1px solid  #EAEDF1;
      }

      &:has(.level-col){
        border-top: 1px solid #EAEDF1;

        .text-vertical{
          width: 6rem;
          min-width: 6rem;
        }

        .level-3{
          border-top: 0;
        }
      }
    }

    .level-3 {
      border-top: 1px solid #EAEDF1;

      & .text-vertical {
        padding: 1rem;
      }

      & .same-level2 {

      }
    }

    .level-4 {
      flex: 1;

      display: flex;
      //border-top: 1px solid  #EAEDF1;

      & > div {
        //box-sizing: border-box;
        //width: 30%;
        //padding: 2rem;
        //vertical-align: middle;
        border-left: 1px solid #EAEDF1;
      }
    }
  }

}

::v-deep.el-radio-group {
  width: 100%;
  display: flex;
  flex-direction: column;

  .el-radio {
    margin-top: 0.75rem;
    display: flex;
    line-height: 1.1rem;
    white-space: break-spaces;

    &.is-disabled .el-radio__label{
      color: #1A1A1A;
    }
    &.is-disabled.is-checked .el-radio__label{
      font-weight: 700;
    }
  }
}
</style>
