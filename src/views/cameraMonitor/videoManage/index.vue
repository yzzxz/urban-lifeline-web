<template>
  <div class="app-container">

    <!-- 列表查询搜索框 -->
    <el-form :model="query" class="query-form" inline>

      <el-form-item label="项目名称">
        <el-input v-model="query.projectId" />
      </el-form-item>

      <!-- <el-form-item label="设备名称">
        <el-input v-model="query.camName" />
      </el-form-item>

      <el-form-item label="设备类型">
        <el-select v-model="query.camType">
          <el-option label="枪机" value="1" />
          <el-option label="球机" value="2" />
        </el-select>
      </el-form-item> -->

      <el-form-item label=" " label-width="2rem">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查 询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleResetQuery">重 置</el-button>
      </el-form-item>

    </el-form>

    <div class="table-container">
      <!-- 列表 -->
      <el-table ref="tableWrapper" v-loading="tableLoading" border stripe row-key="id" :data="tableData"
                :header-cell-style="$store.state.settings.tableHeaderStyle" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" :reserve-selection="true" align="center" />
        <el-table-column label="序号" width="60" align="center">
          <template v-slot="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="projectId" label="项目名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="camName" label="设备名称" min-width="120" />
        <el-table-column prop="camType" label="设备类型" min-width="80">
          <template v-slot="scope">
            <el-tag v-if="scope.row.camType==='1'" type="success">枪机</el-tag>
            <el-tag v-else-if="scope.row.camType==='2'" type="primary">球机</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="camSerialNo" label="序列号" min-width="100" />
        <el-table-column prop="address" label="设备位置" min-width="150" show-overflow-tooltip />
        <!--        <el-table-column prop="" label="设备坐标" min-width="120">-->
        <!--          <template v-slot="scope">-->
        <!--            {{ scope.row.longitude }},{{ scope.row.latitude }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column prop="functionName" label="功能" min-width="150">-->
        <!--          <template v-slot="scope">-->
        <!--            &lt;!&ndash;  &ndash;&gt;-->
        <!--            <el-tag v-for="(item,index) in formatFunctionName(scope.row.functionName)" :key="index" size="small"-->
        <!--                    style="margin-right: 0.5rem;margin-bottom: 0.5rem">-->
        <!--              {{ item }}-->
        <!--            </el-tag>-->

        <!--          </template>-->
        <!--        </el-table-column>-->

        <el-table-column label="回放日期" min-width="150" align="center">
          <template v-slot="scope">
            <el-date-picker v-model="scope.row.date" type="date" :picker-options="pickerOptions" value-format="yyyy-MM-dd"
                            style="width: 100%;" />
          </template>
        </el-table-column>
        <el-table-column label="回放起始时间" min-width="200" align="center">
          <template v-slot="scope">
            <el-time-picker v-model="scope.row.time" is-range value-format="HH:mm:ss" style="width: 100%;" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template v-slot="scope">
            <el-link type="primary" :underline="false" @click="handleVideoPreview(scope.row)">
              回放
            </el-link>
            <!--            <el-divider direction="vertical" />-->
            <!--            <el-popconfirm title="确定要删除吗?" @confirm="()=>delFormData(scope.row.id)">-->
            <!--              <el-link slot="reference" type="primary" :underline="false">-->
            <!--                删除-->
            <!--              </el-link>-->
            <!--            </el-popconfirm>-->
          </template>
        </el-table-column>

        <template #empty>
          <el-empty :image-size="80" />
        </template>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination small :current-page.sync="pageNum" :page-sizes="pageSizeList" :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleChangePageSize"
                       @current-change="handleChangePage" />
      </div>
    </div>
    <!-- 表单编辑弹窗 -->
    <video-dialog :video-data="videoData" :is-show="videoShow" @closeDialog="handleCloseVideoDialog" />
  </div>
</template>
<script>
import BaseCurd from '@/mixin/BaseCurd'
import VideoDialog from './dialog/videoDialog.vue'
// import axios from 'axios'

export default {
  name: 'CameraManage',
  components: {
    VideoDialog
  },
  mixins: [BaseCurd],
  data() {
    return {
      uri: '/api/sec/v1/sec/secCamera/',
      deleteAllId: 'secCameraIds',

      queryDate: [],
      pageSize: 25,

      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },

      videoData: {},
      videoShow: false
    }
  },
  computed: {
    funcList() {
      return this.$store.state.dict.funcList
    }
  },
  watch: {
    queryDate: {
      handler: function(val) {
        if (val && val.length) {
          this.$set(this.query, 'startDate', val[0])
          this.$set(this.query, 'endDate', val[1])
        } else {
          delete this.query['startDate']
          delete this.query['endDate']
        }
      },
      deep: true
    }
  },
  async created() {
    await this.$store.dispatch('dict/getFuncList')
  },
  mounted() {},
  methods: {
    handleResetQuery() {
      this.queryDate = []
      this.handleClearQuery()
    },
    // 视频回放
    handleVideoPreview(row) {
      if (!row.date) {
        // 只能播放同一天的视频
        return this.$message.warning('请先选择回放日期')
      }
      if (!row.time || row.time.length === 0) {
        return this.$message.warning('请先选择回放起始时间')
      }

      if (row.camSerialNo) {
        // 新开一个tab查看回放，解决内网部署
        const url = `http://seuicc.com:8107/?deviceSerial=${row.camSerialNo}&protocol=4&type=2&startTime=${row.date} ${row.time[0]}&stopTime=${row.date} ${row.time[1]}`
        window.open(url, '_blank')
      }
      // const baseUrl = 'http://121.196.179.109:5000'
      // this.url = `http://127.0.0.1:5500/index.html?deviceSerial=${row.camSerialNo}&protocol=4&type=2&startTime=${row.date} ${row.time[0]}&stopTime=${row.date} ${row.time[1]}`
      // this.videoData = {
      //   url: `http://127.0.0.1:5500/index.html?deviceSerial=${row.camSerialNo}&protocol=4&type=2&startTime=${row.date} ${row.time[0]}&stopTime=${row.date} ${row.time[1]}`,
      //   id: row.id,
      //   format: 'flv' // 视频流格式，暂时全部是flv，后续可根据提供的地址作相应调整
      // }
      // console.log(this.videoData.url)
      // this.videoShow = true
      // // console.log(url)
      // setTimeout(() => {
      //   const iframe = document.querySelector('#iframe')
      //   console.log('html', iframe, iframe.contentWindow.document)
      // }, 2000)

      // const loading = this.$loading({
      //   lock: true,
      //   text: '正在获取回放地址，请稍候...',
      //   spinner: 'el-icon-loading',
      //   background: 'rgba(0, 0, 0, 0.7)'
      // })
      // axios({
      //   url: '/api/app/video-wb-collector/video-address',
      //   method: 'get',
      //   params: {
      //     deviceSerial: row.camSerialNo,
      //     protocol: 4,
      //     type: 2,
      //     startTime: `${row.date} ${row.time[0]}`,
      //     stopTime: `${row.date} ${row.time[0]}`
      //   },
      //   headers: {
      //     'Access-Control-Allow-Origin': '*'
      //   }
      // }).then(res => {
      //   console.log('获取录像回放地址', res)
      //   if (res.data.code === '200' && res.data.data.url) {
      //     this.videoData = {
      //       id: row.id,
      //       url: res.data.data.url, // 视频流地址
      //       format: 'flv' // 视频流格式，暂时全部是flv，后续可根据提供的地址作相应调整
      //     }
      //     this.videoShow = true
      //   } else {
      //     this.$message.error('获取录像回放地址失败')
      //   }
      // }).finally(() => {
      //   loading.close()
      // })
    },
    // 关闭视频预览弹窗
    handleCloseVideoDialog() {
      this.videoShow = false
      this.videoData = {}
    },

    formatFunctionName(funcCodeStr) {
      const arr = funcCodeStr?.split(';').filter((item) => !!item) || []
      if (arr && arr.length) {
        return arr.map(
          (code) => this.funcList.find((i) => i.value === code)?.label
        )
      }
      return []
    }
  }
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 0;

  .query-form {
    .el-input,
    .el-select,
    .el-date-editor {
      width: 100%;
    }
  }
  .query-form,
  .table-container {
    padding: 12px 16px;
  }
}
</style>
