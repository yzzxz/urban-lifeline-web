<template>
  <el-dialog top="100px" title="摄像头排序" width="780px" append-to-body :close-on-click-modal="false" :visible.sync="isShow"
             :before-close="handleCancel" @open="handleOpen">

    <div class="list-container">
      <div v-for="(item,index) in dataList" :key="item.id">
        <div>
          <span class="index">{{ index + 1 }}</span>
          <span class="area">工区 {{ item.areaNo }}</span>
          <span>{{ item.camName }}</span>
          <!-- <img v-if="item.imgPath" :src="'/upload/'+item.imgPath+'?token='+token" alt=""> -->
        </div>
        <div>
          <el-button :disabled="index === 0" size="mini" type="primary" icon="el-icon-upload2"
                     @click="handleSort(index,1)" />
          <el-button :disabled="index === dataList.length-1" size="mini" type="primary" icon="el-icon-download"
                     @click="handleSort(index,2)" />
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getToken } from '@/utils/auth'
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      saveLoading: false,
      dataList: []
    }
  },
  computed: {
    token() {
      return getToken()
    }
  },

  methods: {
    // type：1-上移；2-下移
    handleSort(index, type) {
      const arr = this.dataList.splice(index, 1)
      if (type === 1) {
        this.dataList.splice(index - 1, 0, ...arr)
      } else if (type === 2) {
        this.dataList.splice(index + 1, 0, ...arr)
      }

      // this.$forceUpdate()
    },
    handleOpen() {
      this.getList()
    },

    getList() {
      this.$http({
        url: '/api/sec/v1/sec/secCamera/',
        method: 'get',
        params: {
          pageNum: 1,
          pageSize: 99,
          wallFlag: '1',
          sortField: 'wallSort',
          sortOrder: 'ascend'
        }
      }).then((res) => {
        this.dataList = res.data.dataList
      })
    },

    handleSubmit() {
      const secCameraList = []
      this.dataList.map((item, index) => {
        secCameraList.push({
          id: item.id,
          wallSort: index
        })
      })
      this.$http({
        url: '/api/sec/v1/sec/secCamera/updateCameraWall',
        method: 'put',
        data: secCameraList
      }).then((res) => {
        if (res.code === 1) {
          this.$message.success('保存成功！')
          this.$emit('closeDialog', 1)
        }
      })
    },
    handleCancel() {
      this.$emit('closeDialog', 1)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep.el-input,
::v-deep.el-select,
::v-deep.el-textarea {
  width: 500px;
}
.cameraImage {
  img {
    width: 50px;
  }
}

.list-container {
  max-height: 500px;
  overflow: auto;
  & > div {
    margin: 8px;
    padding: 0 30px 8px 30px;
    border-bottom: 1px dotted #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > div {
      line-height: 30px;

      span {
        display: inline-block;
        margin-right: 20px;
      }

      .index {
        width: 60px;
      }
      .area {
        width: 80px;
      }

      img {
        height: 30px;
        vertical-align: middle;
      }
    }
  }
}
</style>
