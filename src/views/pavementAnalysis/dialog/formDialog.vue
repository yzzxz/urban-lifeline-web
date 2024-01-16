<template>
  <el-dialog :title="addOrEdit | formatTitle" width="50rem" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <div class="top">
      <div class="top-title"><span />&ensp;<p>病害信息</p>
      </div>
      <div class="top-box">
        <div class="img">
          <el-image :src="formData.picture | imageUrlFilter" :preview-src-list="formData.replicaSection | formatPreviewSrcList" alt=""
                    style="height: 100%" />
        </div>
        <div class="table">
          <table class="tg">
            <tbody>
              <tr>
                <td class="label">巡查病害</td>
                <td>{{ formatPatrolVirus(formData.patrolVirus) }}</td>
              </tr>
              <tr>
                <td class="label">道路名称</td>
                <td>{{ formatWayName(formData.wayName) }}</td>
              </tr>
              <tr>
                <td class="label">病害编号</td>
                <td>{{ formData.virusNumber }}</td>
              </tr>
              <tr>
                <td class="label">病害位置</td>
                <td>{{ formData.diseaseAddr }}</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
    <el-divider />
    <div class="top">
      <div class="top-title"><span />&ensp;<p>销项信息</p>
      </div>
      <el-form ref="form" label-width="8rem" :model="formData" :rules="rules">
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择" clearable>
            <el-option v-for="item in statusOptions" :key="item.status" :label="item.label" :value="item.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="意见" prop="remarkOpinion">
          <el-input v-model="formData.remarkOpinion" placeholder="请输入" maxlength="200" clearable type="textarea" />
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getFilePath } from '@/utils'
export default {
  name: 'FormDialog',
  filters: {
    formatTitle(val) {
      if (val === 0) {
        return '新增'
      } else if (val === 1) {
        return '销项'
      } else if (val === 2) {
        return '查看'
      }
    },
    formatPreviewSrcList(val) {
      return [getFilePath(val)]
    }
  },
  props: {
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
    },
    activeName: {
      type: String,
      default: 'first'
    }
  },
  data() {
    return {
      rules: {
        remarkOpinion: [{ required: true, message: '请输入', trigger: 'blur' }],
        status: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      statusOptions: [
        {
          status: '1',
          label: '检修暂缓'
        },
        {
          status: '2',
          label: '误报'
        },
        {
          status: '3',
          label: '上报'
        }
      ]
    }
  },

  methods: {
    handleOpen() {
      this.$nextTick(() => {
        // 弹窗打开，清除表单校验
        this.$refs['form'].clearValidate()
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    },
    // 保存或新增项目节点
    handleConfirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$emit('editFormData', this.formData)
        } else {
          return this.$message({
            type: 'warning',
            message: '表单校验失败, 请检查输入!'
          })
        }
      })
    },
    formatWayName(cellVal) {
      return (
        this.$store.state.dict.positionList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    },
    formatPatrolVirus(cellVal) {
      return (
        this.$store.state.dict.pavementList.find((i) => i.value === cellVal)
          ?.label || cellVal
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.top {
  .el-select {
    width: 39rem;
  }

  .top-title {
    display: flex;
    align-items: center;

    span {
      display: inline-block;
      width: 4px;
      height: 12px;
      background: #4279e4;
      margin-right: 0.25rem;
    }

    p {
      font-size: 14px;
      font-weight: bold;
    }
  }

  .top-box {
    display: flex;
    justify-content: space-around;

    .img {
      width: 50%;
      height: 161px;
      //border: 1px solid #ccc;
      //padding: 1rem;
      text-align: center;
      //img{
      //  height: 100%;
      //}
    }

    .tg {
      border-collapse: collapse;
      border-spacing: 0;
      width: 100%;
      color: #54607a;
    }

    .tg td {
      border: 1px solid #e5e5e5;
      font-size: 14px;
      overflow: hidden;
      padding: 6px 5px;
      word-break: normal;

      width: 180px;
      height: 36px;
      vertical-align: center;
    }

    .tg .label {
      background-color: #f3f8fc;
      text-align: right;
      width: 100px;
      padding-left: 10px;
      font-weight: 400;
      color: #303133;
    }
  }
}
</style>
