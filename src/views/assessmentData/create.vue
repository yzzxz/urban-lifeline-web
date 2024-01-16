<template>
  <div class="app-container">
    <!--  -->

    <div class="steps-container">

      <div class="header flex">
        <span class="title">风险评估信息 - {{ !!formData.id ? '编辑' : '录入' }}</span>
        <el-link type="primary" :underline="false" @click="handleBack">
          <svg-icon icon-class="return" /> 返回列表</el-link>
      </div>

      <el-steps :active="activeIndex+1" finish-status="success" align-center>
        <el-step v-for="(item,index) in stepList" :key="index" :title="item.name" style="cursor: pointer"
                 @click.native="handleStep(index)" />
      </el-steps>

    </div>

    <div class="form-container">
      <div class="step-title">
        <span class="title">{{ stepList[activeIndex].name || '' }}</span>
      </div>

      <el-form v-show="activeIndex===0" ref="form" label-width="6rem"
               label-position="right" :model="formData" :rules="rules">

        <el-form-item label="评估单元" prop="evaluationUnitId">
          <el-select ref="evaluationUnitSelect" v-model="formData.evaluationUnitId" placeholder="请选择" clearable>
            <el-option v-for="item in evaluationUnitList" :key="item.value" :label="item.label" :value="item.value" />

            <el-option value="create" style="height: 3rem;margin-top:0.5rem;border-top: 1px solid #ebeef5" disabled @click.stop="">
              <div class="flex" style="padding: 0.5rem">
                <el-input v-model="evaluationUnit" size="small" @click.stop="" />
                <el-button size="small" style="margin-left: 1rem" type="primary" @click.stop="handleCreateEvaluationUnit">新建</el-button>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="道路名称" prop="locationId">
          <el-select v-model="formData.locationId" placeholder="请选择" filterable clearable @change="changeLocation">
            <el-option v-for="item in locationList" :key="item.id" :label="item.locationName" :value="item.id" />
          </el-select>

        </el-form-item>

        <el-form-item label="所在区域">
          <el-select v-model="formData.addr" placeholder="请选择" filterable allow-create clearable>
            <el-option v-for="(item,index) in $store.state.dict.suzhouAddr" :key="index" :value="item" :label="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="长度(m)" prop="extent">
          <el-input v-model="formData.extent" maxlength="10" placeholder="请输入" clearable />
        </el-form-item>

        <el-form-item label="宽度(m)" prop="breadth">
          <el-input v-model="formData.breadth" maxlength="10" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="formData.type" placeholder="请选择" clearable>
            <el-option v-for="item in $store.state.dict.roadTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="道路图片">
          <el-upload action="#" :http-request="handleUpload" accept=".jpg,.jpeg,.png" :file-list="imageUrlList"
                     list-type="picture" :before-upload="beforeUpload" :on-remove="handleRemove">
            <el-button type="primary" size="small">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <!--  风险发生可能性信息  -->
      <div v-if="activeIndex===1">
        <evaluate-table ref="possibility-table" :key="activeIndex" index-classification="可能性指标" :location-task-id="formData.id" />
      </div>

      <div v-if="activeIndex===2">
        <evaluate-table ref="consequence-table" :key="activeIndex" index-classification="后果指标" :location-task-id="formData.id" />
      </div>

    </div>

    <div class="button-container">
      <el-button v-show="activeIndex===0" type="primary" plain @click="resetFormData">重置</el-button>
      <el-button v-show="activeIndex!==0" type="primary" plain @click="stepPrevious">上一步</el-button>
      <el-button v-show="activeIndex!==0" type="primary" plain @click="saveEvaluation">{{ activeIndex===1?'暂存':'保存' }}</el-button>
      <el-button v-show="activeIndex!==2" type="primary" @click="stepNext">下一步</el-button>
    </div>
  </div>
</template>
<script>
import FileUpload from '@/mixin/FileUpload'
import { validNumberGt0 } from '@/utils/validate'
import EvaluateTable from './components/evaluateTable.vue'
import { getFilePath, getUUID } from '@/utils'
export default {
  components: {
    EvaluateTable
  },
  mixins: [FileUpload],
  data() {
    return {
      curdMountedMixin: false,

      activeIndex: 0,
      stepList: [
        {
          name: '道路基本信息',
          indexClassification: ''
        },
        {
          name: '风险发生可能性信息',
          indexClassification: '可能性指标'
        },
        {
          name: '风险发生后果评价信息',
          indexClassification: '后果指标'
        }
      ],

      // 评估单元下拉选
      evaluationUnitList: [],
      evaluationUnit: '',

      locationList: [],

      formData: {
        id: '',
        // 图片数组初始化
        imagePath: []
      },
      rules: {
        evaluationUnitId: [
          { required: true, message: '请选择或新建评估单元', trigger: 'blur' }
        ],
        locationId: [
          { required: true, message: '请选择道路', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择道路类型', trigger: 'blur' }
        ],
        extent: [
          { validator: validNumberGt0, trigger: 'blur' }
        ],
        breadth: [
          { validator: validNumberGt0, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    imageUrlList() {
      return this.formData.imagePath ? this.formData.imagePath.map(url => {
        return {
          uuid: getUUID(32),
          name: url.replace('scl/evaluation/', ''),
          url: getFilePath(url)
        }
      }) : []
    }
  },
  async beforeCreate() {
    // await this.$store.dispatch('dict/getPavementList')
    await this.$store.dispatch('dict/getRoadTypeList')
    // await this.$store.dispatch('dict/getPositionList')
  },
  created() {
    this.getEvaluationUnitList()
    this.getLocationList()
  },
  mounted() {
    if (this.$route.query.id) {
      this.getFormDataById(this.$route.query.id)
    }
  },
  methods: {
    // 初始化表单数据
    getFormDataById(id) {
      if (!id) {
        this.formData = {
          locationId: '',
          locationCode: '',
          locationName: '',
          evaluationUnitId: '',
          addr: '',
          type: '',
          extent: '',
          breadth: '',
          imagePath: []
        }
      }

      this.$http.get(`/api/scl/v1/scl/sclLocationTask/${id}`).then(res => {
        if (res?.code === 1) {
          this.$set(this, 'formData', {
            ...res.data,
            imagePath: res.data.imagePath && res.data.imagePath.length ? res.data.imagePath?.split(';') : []
          })

          console.log(this.formData)
        }
      })
    },

    getLocationList() {
      this.$http({
        url: '/api/scl/v1/scl/sclLocation/',
        method: 'get',
        params: {
          pageSize: -1,
          pageNum: -1,
          checkType: 'FXPG'
        }
      }).then(res => {
        if (res?.code === 1 && res.data) {
          this.locationList = res.data.dataList
        }
      })
    },
    changeLocation(id) {
      const temp = this.locationList.find(i => i.id === id)
      this.$set(this.formData, 'locationCode', temp?.locationCode || '')
      this.$set(this.formData, 'locationName', temp?.locationName || '')
      this.$set(this.formData, 'evaluationUnitId', temp?.evaluationUnitId || '')
      this.$set(this.formData, 'type', temp?.type || '')
      this.$set(this.formData, 'extent', temp?.extent || '')
      this.$set(this.formData, 'breadth', temp?.breadth || '')
      this.$set(this.formData, 'addr', temp?.addr || '')
    },
    // 获取评估单元列表
    getEvaluationUnitList() {
      this.$http.get('/api/scl/v1/scl/sclEvaluation/dropdown').then(res => {
        if (res?.code === 1 && res.data) {
          this.evaluationUnitList = Object.keys(res.data).map(key => {
            return {
              label: res.data[key],
              value: key
            }
          })
        }
      })
    },

    // 新增评估单元
    handleCreateEvaluationUnit() {
      this.$http({
        url: '/api/scl/v1/scl/sclEvaluation/',
        method: 'post',
        data: {
          evaluationUnit: this.evaluationUnit
        }
      }).then(res => {
        if (res.code === 1) {
          this.getEvaluationUnitList()
          this.formData.evaluationUnitId = res.data?.id

          this.evaluationUnit = ''
          this.$refs['evaluationUnitSelect'].blur()
        }
      })
    },

    // 保存表单 (道路基本信息)
    saveFormData(cb) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // 保存道路基本信息
          this.$http({
            url: '/api/scl/v1/scl/sclLocationTask/',
            method: 'post',
            data: {
              ...this.formData,
              // 图片数据拼接保存
              imagePath: this.formData.imagePath.join(';')
            }
          }).then(res => {
            if (res?.code === 1) {
              // this.$set(this, 'formData', {
              //   ...res.data,
              //   imagePath: res.data.imagePath && res.data.imagePath.length ? res.data.imagePath?.split(';') : []
              // })
              this.$set(this.formData, 'id', res.data?.id || '')
              this.$message.success('保存成功！')
              cb && cb()
            }
          })
        } else {
          return this.$message({
            type: 'warning',
            message: '表单校验失败, 请检查输入!'
          })
        }
      })
    },

    // 保存评价树
    saveEvaluation() {
      if (this.activeIndex === 1) {
        this.$refs['possibility-table'].saveEvaluation()
      } else if (this.activeIndex === 2) {
        this.$refs['consequence-table'].saveEvaluation(() => {
          this.handleBack()
        })
      }
    },

    // 道路图片上传
    handleUpload(param) {
      this.uploadFile(param,
        { folder: 'scl/evaluation' },
        (imgPath) => {
          this.formData.imagePath.push(imgPath)
        }
      )
    },
    handleRemove(file) {
      const index = this.formData.imagePath.findIndex(i => i.includes(file.name))
      // console.log(file, index)
      if (index !== -1) {
        this.formData.imagePath.splice(index, 1)
      }
    },

    // 表单重置
    resetFormData() {
      this.getFormDataById(this.formData.id)
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },

    // 下一步
    stepNext() {
      if (this.activeIndex === 0) {
        this.saveFormData(() => {
          this.handleStep(this.activeIndex + 1)
        })
      } else if (this.activeIndex === 1) {
        this.$refs['possibility-table'].saveEvaluation(() => {
          this.handleStep(this.activeIndex + 1)
        })
      }
      // else if (this.activeIndex === 2) {
      //   this.$refs['consequence-table'].saveEvaluation(() => {
      //     this.handleBack()
      //   })
      // }
    },
    // 上一步
    stepPrevious() {
      // 保存道路基本信息
      this.handleStep(this.activeIndex - 1)
    },

    // 步骤跳转
    handleStep(index) {
      if (index === this.activeIndex) {
        return
      }

      if (this.activeIndex === 0 && !this.formData.id) {
        return this.$message.warning('请先录入道路基本信息并保存')
      }

      if (index < 0 || index > this.stepList.length - 1) {
        return
      }
      this.activeIndex = index
    },

    handleBack() {
      this.$router.go(-1)
    }

  }
}
</script>
<style scoped lang="scss">
.text-vertical{
  vertical-align: middle;
  text-align: center;
  writing-mode: vertical-rl;
  text-orientation: upright;
}
.app-container {
  padding: 0;
  position: relative;
  .steps-container {
    padding: 12px 16px;

    .header {
      width: 100%;
      height: 3rem;
      line-height: 3rem;
      position: relative;
      span.title {
        font-size: 16px;
        color: #1d2129;
        font-weight: 600;
      }
    }
  }

  .form-container {
    margin: 1rem auto;
    width: calc(100% - 32px);
    border: 1px solid #ebeef5;

    .step-title {
      background-color: #f3f8fc;
      height: 40px;
      line-height: 40px;

      padding: 0 16px;

      span.title {
        color: #303133;
        font-size: 16px;
        font-weight: 600;

        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 14px;
          background-color: #4279e4;
          margin-right: 0.5rem;
        }
      }
    }

    .el-form {
      width: 500px;
      margin: 1rem auto;
      .el-select {
        width: 100%;
      }
    }

    .risk-info {
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

      .level{
        //border: 1px solid  #4279E4;
        //padding: 1rem;
        //display: flex;

        &-1{
          //background-color: #3b87d5;
          background: #E5F1FF;

          & .text-vertical{
            padding: 1rem;
          }
        }

        &-2{
          background: #E9F4FD;
          border-left: 1px solid  #EAEDF1;
          border-right: 1px solid  #EAEDF1;
          & .text-vertical{
            padding: 1rem;
          }
        }

        &-3{
          background: #F1F6FA;
          border-top: 1px solid  #EAEDF1;
          & .text-vertical{
            padding: 1rem;
          }

          &:nth-child(odd) .level-4{
            background-color: #F4F5F7;
          }
        }

        &-4{
          flex:1;
          background: #fff;
          display: flex;
          //border-top: 1px solid  #EAEDF1;

          &>div{
            //width: 30%;
            padding: 3rem;
            //vertical-align: middle;
            border-left: 1px solid  #EAEDF1;
          }
          .radio-group{
            width: 50%;

            ::v-deep.el-radio-group {
              display: flex;
              flex-direction: column;
              .el-radio {
                margin-top: 0.5rem;
              }
            }
          }
          .score,
          .evaluate{
            width: 25%;
            display: flex;
            align-items: center;

            span{
              width: 6rem;
              //margin-right: 1rem;
            }

            .el-input{
             width: 8rem;
            }
          }
        }
      }
    }

  }

  .button-container {
    width: 100%;

    padding: 12px 16px;
    text-align: right;

    border-top: 1px solid #ebeef5;

    // position: absolute;
    // bottom: 0;
    // left: 0;
  }
}
</style>
