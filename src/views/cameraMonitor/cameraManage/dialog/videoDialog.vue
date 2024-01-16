<template>
  <el-dialog title="" width="70rem" append-to-body :close-on-click-modal="true" :visible.sync="isShow" :show-close="false"
             :before-close="handleCancel" :destroy-on-close="true" @open="handleOpen">
    <div class="video-container">
      <video-player :key="videoData.id" :video="videoData" />
    </div>
  </el-dialog>
</template>

<script>
import VideoPlayer from '@/components/VideoPlayer/index.vue'
/**
 * 视频画面
 */
export default {
  name: 'VideoDialog',
  components: {
    VideoPlayer
  },
  props: {
    videoData: {
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
    }
  },
  data() {
    return {}
  },
  methods: {
    handleOpen() {},
    handleCancel() {
      this.$emit('closeDialog')
    }
  }
}
</script>

<style scoped>
::v-deep .el-dialog__header {
  display: none;
}
::v-deep .el-dialog__body {
  padding: 0;
}
.video-container {
  width: 100%;
  height: 40rem;

  background-color: #1d2129;
}
</style>
