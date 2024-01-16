<template>
  <div class="user-info">

    <div class="search-box">
      <!-- <el-input v-model="query" size="small" prefix-icon="el-icon-search" placeholder="请输入搜索内容" /> -->
    </div>

    <el-badge class="message-count" :value="total" :max="99">
      <svg-icon icon-class="mail" class="message-icon" @click="handleViewMsg" />
    </el-badge>

    <!-- <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"> -->
    <el-popover ref="popover" placement="bottom" width="150" trigger="click">
      <div slot="reference" class="" style="display: flex;align-items: center;cursor: pointer">
        <svg-icon icon-class="user-circle" class="user-avatar" />
        <span class="user-name">{{ name || '用户' }}</span>
        <i class="el-icon-caret-bottom" />
      </div>
      <el-link :underline="false" icon="el-icon-switch-button" @click="logout">退出登录</el-link>
    </el-popover>

    <el-dialog title="消息详情" :visible.sync="dialogVisible" width="35rem" append-to-body class="notify-dialog">
      <div class="flex" style="justify-content:flex-start">
        <img src="@/assets/images/message-alarm.png" alt="">
        <div style="margin-left:1rem">
          <div class="title" style="font-weight:600">{{ moduleName === 'daolu'?'设备离线通知':'设备预警通知' }}</div>
        </div>
      </div>

      <div v-if="moduleName === 'daolu'" class="message-list">
        <div v-for="item in tableData" :key="item.id" class="flex message-detail">
          <el-link type="primary" @click="handleRoute">{{ deviceTypeMap[item.deviceType] }} {{ item.deviceName }}</el-link> <span>已离线，请前往查看。</span>
        </div>
      </div>

      <div v-if="moduleName === 'yujing'" class="message-list">
        <div v-for="item in tableData" :key="item.id" class="flex message-detail">
          <el-link type="primary" @click="handleRoute(1)">{{ deviceTypeMap[item.devType] }} </el-link>
          <span style="margin-left: 1rem"> <span :class="'dot warn' + item.warnLevel" /> {{ roadRiskLevel[item.warnLevel].name + '预警' }} </span>
          <span style="color: #999;font-size: 12px;margin-left: 2rem">{{ item.createDate | dateTimeFilter }}</span>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

  </div>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {},
  data() {
    return {
      query: '',

      dialogVisible: false,

      timer: null,

      deviceTypeMap: {},
      tableData: [],
      total: ''
    }
  },
  computed: {
    ...mapGetters(['subTitle', 'sidebar', 'name', 'avatar']),
    roadRiskLevel() {
      return this.$store.state.dict.roadRiskLevel
    },
    moduleName() {
      return sessionStorage.getItem('MODULE_NAME')
    }
  },
  created() {

  },
  mounted() {
    this.getDeviceTypeList()
    this.getMessageNotifications()
    // 消息通知定时获取
    this.timer = window.setInterval(() => {
      this.getMessageNotifications()
    }, 3 * 60 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    handleViewMsg() {
      if (this.total > 0) {
        this.dialogVisible = true
      }
    },
    handleRoute(type) {
      if (type === 1) {
        this.$router.push('/alertManage/alert')
      } else {
        this.$router.push('/monitoringDevice/deviceManage')
      }
      this.dialogVisible = false
    },
    // 获取消息通知
    getMessageNotifications() {
      if (this.moduleName === 'yujing') {
        this.$http({
          url: '/api/scl/v1/scl/sclDeviceWarn/',
          method: 'get'
        }).then(res => {
          if (res.code === 1) {
            this.tableData = res.data.dataList
            this.total = res.data.total > 0 ? res.data.total : ''
          }
        })
      } else if (this.moduleName === 'daolu') {
        // 设备离线查询
        this.$http({
          url: '/api/scl/v1/scl/sclDevice/dl',
          method: 'get',
          params: {
            pageNum: -1,
            pageSize: -1,
            state: '0'
          }
        }).then(res => {
          if (res.code === 1) {
            this.tableData = res.data.dataList
            this.total = res.data.total > 0 ? res.data.total : ''
          }
        })
      }
    },
    getDeviceTypeList() {
      this.$http({
        url: '/api/sys/v1/sys/sysDict/dropDown/' + (this.moduleName === 'daolu' ? 'SCL_DEVICE_TYPE' : 'SCL_MONITORING_ITEM'),
        method: 'get'
      }).then(res => {
        this.deviceTypeMap = res.data
      })
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  color: #fff;
  display: flex;
  align-items: center;
  &:focus {
    outline: none;
  }

  .search-box {
    color: #fff;
    ::v-deep.el-input__inner {
      color: #000000;
      background-color: rgba(#ebedf0, 0.5);
      border: none;
    }
    ::v-deep.el-input__icon {
      color: #000000;
    }

    // placeholder字体色
    ::-webkit-input-placeholder {
      color: #000;
    }
    ::-moz-placeholder {
      color: #000;
    }
    :-ms-input-placeholder {
      color: #000;
    }
  }
  .message-count {
    margin: 0 3rem;
  }
  .message-icon,
  .user-avatar {
    cursor: pointer;
    width: 20px;
    height: 20px;
    border-radius: 50%;

    margin-right: 10px;
  }

}
</style>

<style lang="scss">
.notify-dialog{
.el-dialog__body{
  padding: 16px;
}
  .message-list{
    height: 20rem;
    overflow-y: scroll;

    .message-detail{
      justify-content: flex-start;
      padding: 12px;
      white-space: nowrap;
      border-bottom: 1px solid #EAEDF1;
      span{
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
