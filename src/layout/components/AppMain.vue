<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" />
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.app-main {
  /* 50 = navbar; 50 = header */
  min-height: calc(100vh - 100px);
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;

  background: url('~@/assets/images/app-bg.png') no-repeat;
  background-position: top;
  background-size: contain;

  padding: 0 16px 16px 16px;
}
.fixed-header + .app-main {
  padding-top: 100px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
