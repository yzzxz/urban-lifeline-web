<template>
  <div class="warning-box">
    <div class="title red flex">
      <span>告警信息</span>
      <!-- <span class="el-icon-close" style="cursor: pointer" @click="closeWindow" /> -->
    </div>
    <div class="flex header">
      <img src="@/assets/images/alarmIcon.png" alt="">
      <div>
        <span>告警设备</span>
        <div class="" style="margin-top: 0.5rem">
          <span>{{ cameraData.camName }}</span>
          <span> - {{ cameraData.address }}</span>
        </div>
      </div>
    </div>
    <div class="content">
      <el-carousel trigger="click" height="200px" indicator-position="none" :interval="5000">
        <el-carousel-item v-for="item in warningList" :key="item.id">

          <el-descriptions :column="2" direction="vertical" :colon="false"
                           :label-style="{'font-weight':600}">
            <el-descriptions-item label="告警类型">{{ item.funcIdName }}</el-descriptions-item>
            <el-descriptions-item label="时间">{{ item.timeStramp | dateTimeFilter }}</el-descriptions-item>
          </el-descriptions>
          <div style="display:flex;align-items:center;justify-content:center;">
            <el-image :src="item.imageUrl" :preview-src-list="[item.imageUrl]" style="height: 150px" alt="">
              <div slot="error" class="image-slot">
                <img src="@/assets/images/noData.png" alt="">
              </div>
            </el-image>
          </div>

        </el-carousel-item>
      </el-carousel>
    </div>

  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'MapInfoWindow',
  props: {
    cameraData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      warningList: []
    }
  },
  watch: {
    'cameraData.id': {
      handler: function() {
        this.getWarningList()
      },
      immediate: true
    }
  },
  methods: {
    getWarningList() {
      this.$http({
        url: '/api/sec/v1/sec/secJoin/',
        method: 'get',
        params: {
          camId: this.cameraData.id
        }
      }).then(res => {
        if (res.code === 1 && res.data && res.data.dataList) {
          this.warningList = res.data.dataList.map(item => {
            return {
              ...item,
              funcIdName: this.formatFunctionName(item.funcId),
              projectName: this.formatProjectName('', '', item.projectId),
              imageUrl: `/upload/secImage/${item.funcId}/${item.bizId}.jpg?token=${getToken()}`
            }
          })
        }
      })
    },

    closeWindow() {
      this.$emit('closeWindow')
    },

    formatFunctionName(code) {
      return this.$store.state.dict.funcList.find(i => i.value === code)?.label || code
    },

    formatProjectName(row, col, cellVal) {
      return this.$store.state.dict.projectList.find(i => i.value === cellVal)?.label || cellVal
    }
  }
}
</script>

<style scoped lang="scss">
.warning-box{
  border-radius: 4px;
  overflow: hidden;
  width: 300px;
  background-color: #fff;

  .title{
    color: #fff;
    padding:4px 20px;

    &.red{
      background: linear-gradient(to right, red, pink);
    }
  }

  .header{
    padding: 0 16px 12px 16px;

    &>div{
      flex: 1;
      margin-left:1rem;

      .dot{
        &.blue{
          color: #366EF4;

          &::before{
            content: '';
            display: inline-block;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            margin-right: 0.5rem;
            background-color: #366EF4;
          }
        }
        &.green{
          color: #67C23A;

          &::before{
            content: '';
            display: inline-block;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            margin-right: 0.5rem;
            background-color: #67C23A;
          }
        }
      }

      .message{
        margin-top: 1rem;
        color: #FF0505;
      }
    }
  }

  .content{
    padding: 0 16px 12px 16px;
  }

}

</style>
