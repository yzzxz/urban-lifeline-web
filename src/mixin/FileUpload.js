/**
 * 文件上传
 */
export default {
  data() {
    return {
      uploadUrl: '/api/sys/v1/oss/filerecord/folderFile'
    }
  },
  methods: {

    /**
     * 文件上传
     * @param  param 文件
     * @param  form FormData自定义参数
     * @param  cb 上传成功的回调，参数为接口返回的文件路径
     */
    uploadFile(param, form, cb) {
      const formData = new FormData()
      Object.keys(form)?.map(key => {
        formData.append(key, form[key])
      })
      formData.append('file', param.file)

      const loading = this.$loading({
        lock: true,
        text: '正在上传',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$http({
        url: this.uploadUrl,
        method: 'post',
        data: formData
      })
        .then((res) => {
          if (res.code === 1) {
            this.$message.success('上传文件成功')
            // 执行回调
            cb && cb(res.data)
          }
          loading.close()
        })
        .catch((err) => {
          console.log('err :>> ', err)
          loading.close()
        })
    },
    // 上传文件大小限制
    beforeUpload(file) {
      console.log('beforeUpload file :>> ', file.size)
      // 6M 大小
      const isLt6M = file.size / 1024 / 1024 <= 6

      if (!isLt6M) {
        this.$message.error('导入Excel文件大小不能超过 6M!')
      }
      return isLt6M
    }
  }
}
