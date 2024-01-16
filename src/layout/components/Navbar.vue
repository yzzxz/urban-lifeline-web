<template>
  <div class="navbar">
    <!-- <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" /> -->

    <!-- <breadcrumb class="breadcrumb-container" /> -->
    <div class="breadcrumb-container">
      <span class="route-name">
        {{ currentRouteName }}
      </span>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
// import Hamburger from '@/components/Hamburger'

export default {
  components: {
    // Breadcrumb,
    // Hamburger
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar']),
    currentRouteName() {
      // console.log(this.$route)
      return this.$route.meta?.title
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: transparent;
  // box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    // float: left;
    height: 100%;
    display: flex;
    align-items: center;
    .route-name {
      display: inline-block;
      background-color: #fff;
      box-sizing: border-box;
      // line-height: 50px;
      padding: 5px 8px 5px 12px;
      letter-spacing: -0.01px;
      color: #4279e4;

      cursor: default;

      margin-left: 16px;
    }
  }
}
</style>
