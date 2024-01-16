<template>
  <div class="video-box">
    <video :id="video.id" ref="video" class="video-js vjs-big-play-centered vjs-fluid" controls preload="auto" width="100%" height="100%" />
  </div>
</template>

<script>
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import 'videojs-flvjs-es6'
import 'videojs-flash'
export default {
  name: 'VideoPlayer',
  props: {
    // 视频流信息
    video: {
      type: Object,
      required: true,
      default: () => {
        return {
          id: '', // id 唯一
          url: '', // 视频流地址
          format: 'mp4' // 视频流格式 : hls   flv   rtmp  mp4
        }
      }
    }
  },
  data() {
    return {
      videoPlayer: null
    }
  },

  activated() {},

  mounted() {
    this.initPlayer()
  },

  beforeDestroy() {
    // 销毁播放器
    this.videoPlayer?.dispose()
    this.videoPlayer = null
  },
  methods: {
    // 初始化播放器
    initPlayer(video) {
      video = video || this.video
      this.videoPlayer?.src('')
      this.videoPlayer?.dispose()
      this.videoPlayer = null

      if (!video || !video.url) return
      const dom = this.$refs['video']

      if (!dom) return
      // 通用配置
      const config = {
        autoplay: 'muted', // 自动播放
        controls: true, // 用户可以与之交互的控件
        loop: true, // 视频一结束就重新开始
        muted: true, // 默认情况下将使所有音频静音
        aspectRatio: '16:9', // 显示比率
        fullscreen: {
          options: { navigationUI: 'hide' }
        }
        // preload: 'metadata',
        // bigPlayButton: false,
        // autoplay: true,
        // controls: true,
        // muted: true,
        // textTrackDisplay: true,
        // errorDisplay: true
      }

      if (video.format === 'hls') {
        // hls
        this.videoPlayer = videojs(dom, {
          ...config,
          techOrder: ['html5', 'flvjs'],
          html5: {
            hls: {
              withCredentials: true
            }
          },
          sources: [
            {
              src: video.url,
              type: 'application/x-mpegURL'
            }
          ]
        })
      } else if (video.format === 'flv') {
        // flv
        this.videoPlayer = videojs(dom, {
          ...config,
          techOrder: ['html5', 'flvjs'],
          flvjs: {
            mediaDataSource: {
              isLive: false,
              cors: true,
              withCredentials: false
            }
          },
          sources: [{ src: video.url, type: 'video/x-flv' }]
        })
      } else if (video.format === 'rtmp') {
        // 其他  // rtmp
        this.videoPlayer = videojs(dom, {
          ...config,
          techOrder: ['html5', 'flash'],
          sources: [{ src: this.videoUrl, type: 'rtmp/flv' }]
        })
      } else if (video.format === 'mp4') {
        this.videoPlayer = videojs(dom, {
          ...config,
          sources: [{ src: this.videoUrl, type: 'video/mp4' }]
        })
      }

      // this.videoPlayer?.src(video.url)
      this.videoPlayer?.play()
    }
  }
}
</script>
<style scoped lang="scss">
.video-box {
  width: 100%;
  height: 100%;
  min-width: 400px;
  min-height: 300px;

  ::v-deep .video-js {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
