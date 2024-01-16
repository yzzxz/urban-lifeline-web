<template>
  <el-dialog top="100px" title="摄像头管理" width="860px" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">
    <el-form ref="form" label-width="150px" :model="formData" :rules="rules" inline>
      <el-form-item label="名称" prop="camName">
        <el-input v-model="formData.camName" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="序列号" prop="camSerialNo">
        <el-input v-model="formData.camSerialNo" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="设备类型" prop="camType">
        <el-select v-model="formData.camType" placeholder="请选择">
          <el-option label="枪机" value="枪机" />
          <el-option label="球机" value="球机" />
        </el-select>
      </el-form-item>
      <el-form-item label="工区" prop="areaNo">
        <el-select v-model="formData.areaNo" collapse-tags placeholder="请选择">
          <el-option v-for="(item,index) in 5" :key="index" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="功能" prop="functionName">
        <el-select v-model="formData.functionName" multiple collapse-tags placeholder="请选择">
          <el-option v-for="(item,index) in funcOptionList" :key="index" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="视频流地址" prop="linkAddress">
        <el-input v-model="formData.linkAddress" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="备用视频流地址" prop="linkAddress2">
        <el-input v-model="formData.linkAddress2" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="视频子码流地址" prop="linkAddress3">
        <el-input v-model="formData.linkAddress2" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="局域网内视频流地址" prop="linkAddress4">
        <el-input v-model="formData.linkAddress2" placeholder="请输入" clearable />
      </el-form-item>

      <el-row>
        <el-form-item label="摄像头背景图">
          <el-upload ref="upload" action :show-file-list="false" :http-request="handleUpload" :before-upload="beforeUpload">
            <!-- <i v-else class="el-icon-plus avatar-uploader-icon" /> -->
            <el-link size="mini" type="primary" :underline="false">点击上传图片</el-link>
          </el-upload>
          <div v-if="formData.imgPath" class="cameraImage">
            <img :src="formData.imgPath | imageUrlFilter" alt="">
          </div>
        </el-form-item>
      </el-row>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="formData.remarks" type="textarea" rows="5" placeholder="请输入" clearable />
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getFilePath, getUUID } from '@/utils/index'
import { getToken } from '@/utils/auth'
export default {
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
    funcOptionList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      saveLoading: false,
      rules: {
        camName: [
          { required: true, message: '请输入', trigger: 'blur' } // 此处为用户输入不规则时的提示
        ],
        areaNo: [{ required: true, message: '请输入', trigger: 'blur' }],
        address: [{ required: true, message: '请输入', trigger: 'blur' }],
        functionName: [{ required: true, message: '请输入', trigger: 'blur' }],
        linkAddress: [{ required: true, message: '请输入', trigger: 'blur' }],
        areaId: [{ required: true, message: '请选择', trigger: 'blur' }]
      },

      imgUrl: ''
    }
  },
  computed: {
    token() {
      return getToken()
    }
  },

  methods: {
    handleOpen() {
      if (this.addOrEdit === 0) {
        this.$set(this.formData, 'functionName', [])
      } else if (this.addOrEdit === 1 && this.formData.functionName) {
        this.$set(
          this.formData,
          'functionName',
          this.formData.functionName.split(';')
        )
      }

      this.imgUrl = getFilePath(this.formData.imgPath)

      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },

    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const para = { ...this.formData }
          para.functionName =
            Array.isArray(this.formData.functionName) &&
            this.formData.functionName.length > 0
              ? this.formData.functionName.join(';')
              : ''
          if (this.addOrEdit === 0) {
            this.$emit('addFormData', para)
          } else {
            this.$emit('editFormData', para)
          }
        } else {
          return this.$message.warning('表单校验失败，请检查输入!')
        }
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 0)
    },

    handleUpload(param) {
      const entityId = getUUID(32)
      if (entityId) {
        const formData = new FormData()
        formData.append('entityId', entityId)
        formData.append('folder', 'ugs-folder')
        formData.append('file', param.file)

        const loading = this.$loading({
          lock: true,
          text: '正在上传……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http({
          url: '/api/sys/v1/oss/filerecord/folderFile',
          method: 'post',
          data: formData
        })
          .then((res) => {
            if (res.code === 1) {
              // this.fileList.push({
              //   id: entityId,
              //   filePath: res.data,
              //   name: param.file.name,
              //   url: `/upload/${res.data}?token=${getToken()}`
              // })
              this.$message.success('上传文件成功')

              this.formData.imgPath = res.data
            }
            loading.close()
          })
          .catch((err) => {
            console.log('err :>> ', err)
            loading.close()
          })
      } else {
        this.$message.warning('获取id失败！')
      }
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isJPG && !isPNG) {
        this.$message.error('上传图像图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt5M) {
        this.$message.error('上传图像图片大小不能超过 5M!')
      }
      return (isJPG || isPNG) && isLt5M
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep.el-input,
::v-deep.el-select {
  width: 240px;
}
::v-deep.el-textarea {
  width: 640px;
}
.cameraImage {
  img {
    width: 50px;
  }
}
</style>
