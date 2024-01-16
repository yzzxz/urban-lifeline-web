import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    redirect: '/pavementAnalysis/pavementDetail'
  },
  {
    path: '/pinggu',
    redirect: '/riskManage/assessmentData'
  },
  {
    path: '/sanpo',
    redirect: '/machineTrack/machine'
  },

  // --------------------------  实时监测分析  --------------------------
  {
    path: '/monitoringData',
    component: Layout,
    redirect: '/monitoringData/realtime',
    meta: { title: '监测数据查询', icon: 'monitoring-data', module: 'daolu' },
    children: [
      {
        path: 'realtime',
        name: 'Realtime',
        component: () => import('@/views/monitoringData/realtime/index'),
        meta: { title: '实时监测数据查询' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/monitoringData/history/index'),
        meta: { title: '历史监测数据查询' }
      }
    ]
  },

  {
    path: '/monitoringDevice',
    component: Layout,

    meta: { title: '监测设备管理', icon: 'monitoring-device', module: 'daolu' },
    children: [
      {
        path: 'deviceManage',
        name: 'DeviceManage',
        component: () => import('@/views/monitoringDevice/index'),
        meta: { title: '监测设备管理' }
      }

    ]
  },

  {
    path: '/monitoringDataAnalysis',
    component: Layout,

    meta: { title: '监测数据分析', icon: 'monitoring-analysis', module: 'daolu' },
    children: [
      {
        path: 'correlation',
        name: 'Correlation',
        component: () => import('@/views/monitoringDataAnalysis/correlation/index'),
        meta: { title: '相关性分析' }
      },
      {
        path: 'trend',
        name: 'Trend',
        component: () => import('@/views/monitoringDataAnalysis/trend/index'),
        meta: { title: '趋势分析' }
      },
      {
        path: 'eigenvalue',
        name: 'Eigenvalue',
        component: () => import('@/views/monitoringDataAnalysis/eigenvalue/index'),
        meta: { title: '特征值分析' }
      }
    ]
  },

  // --------------------------  监测预警管理  --------------------------
  {
    path: '/thresholdManage',
    component: Layout,
    meta: { title: '指标阈值管理', icon: 'threshold-manage', module: 'yujing' },
    children: [
      {
        path: 'threshold',
        name: 'Threshold',
        component: () => import('@/views/thresholdManage/index'),
        meta: { title: '指标阈值管理' }
      }
    ]
  },
  {
    path: '/alertManage',
    component: Layout,

    meta: { title: '指标预警管理', icon: 'alarm-warning-fill', module: 'yujing' },
    children: [
      {
        path: 'alert',
        name: 'Alert',
        component: () => import('@/views/alertManage/index'),
        meta: { title: '指标预警管理' }
      }
    ]
  },

  // --------------------------  道路决策  --------------------------
  {
    path: '/pavementAnalysis',
    component: Layout,
    meta: { title: '路面病害分析', icon: 'pavement-analysis', module: 'juece' },
    children: [
      // {
      //   path: 'pavement',
      //   name: 'Pavement',
      //   component: () => import('@/views/pavementAnalysis/index'),
      //   meta: { title: '路面病害分析' }
      // },
      {
        path: 'pavementDetail',
        name: 'PavementDetail',
        // hidden: true,
        component: () => import('@/views/pavementAnalysis/detail.vue'),
        meta: { title: '路面病害分析' }
      }
    ]
  },
  {
    path: '/subgradesAnalysis',
    component: Layout,
    meta: { title: '路基病害分析', icon: 'subgrades-analysis', module: 'juece' },
    children: [
      // {
      //   path: 'subgrades',
      //   name: 'Subgrades',
      //   component: () => import('@/views/subgradesAnalysis/index'),
      //   meta: { title: '路基病害分析' }
      // },
      {
        path: 'subgradesDetail',
        name: 'SubgradesDetail',
        // hidden: true,
        component: () => import('@/views/subgradesAnalysis/detail.vue'),
        meta: { title: '路基病害分析' }
      }
    ]
  },
  {
    path: '/reportManager',
    component: Layout,
    meta: { title: '分析报告管理', icon: 'report', module: 'juece' },
    children: [
      {
        path: 'reportManager',
        name: 'ReportManager',
        component: () => import('@/views/reportManager/index'),
        meta: { title: '分析报告管理' }
      }
    ]
  },

  // --------------------------  道路风险评估  --------------------------
  {
    path: '/riskManage',
    component: Layout,
    meta: { title: '风险评估数据管理', icon: 'hand-coin-fill', module: 'pinggu' },
    children: [
      {
        path: 'assessmentData',
        name: 'AssessmentData',
        component: () => import('@/views/assessmentData/index'),
        meta: { title: '风险评估数据管理' }
      },
      {
        path: 'assessmentInfo',
        name: 'AssessmentInfo',
        hidden: true,
        component: () => import('@/views/assessmentData/create.vue'),
        meta: { title: '风险评估数据维护' }
      }
    ]
  },
  {
    path: '/targetManage',
    component: Layout,
    meta: { title: '风险评估指标管理', icon: 'target-manage', module: 'pinggu' },
    children: [
      {
        path: 'possibility',
        name: 'Possibility',
        component: () => import('@/views/targetManage/possibility/index'),
        meta: { title: '可能性指标管理' }
      },
      {
        path: 'consequence',
        name: 'Consequence',
        component: () => import('@/views/targetManage/consequence/index'),
        meta: { title: '后果指标管理' }
      },
      {
        path: 'weightCoefficient',
        name: 'WeightCoefficient',
        component: () => import('@/views/targetManage/weightCoefficient/index'),
        meta: { title: '指标权重管理' }
      }
    ]
  },
  {
    path: '/riskAssessment',
    component: Layout,
    meta: { title: '道路总体风险分析', icon: 'risk-assessment', module: 'pinggu' },
    children: [
      {
        path: 'general',
        name: 'General',
        component: () => import('@/views/riskAssessment/general/index'),
        meta: { title: '风险总体评估' }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/riskAssessment/report/index'),
        meta: { title: '评估报告管理' }
      }
    ]
  },

  // --------------------------  第三方破坏  --------------------------

  {
    path: '/machineTrack',
    component: Layout,
    meta: { title: '机械轨迹监测', icon: 'machine-track', module: 'sanpo' },
    children: [
      {
        path: 'machine',
        name: 'Machine',
        component: () => import('@/views/machineTrack/machine/index'),
        meta: { title: '监测设备管理' }
      },
      {
        path: 'track',
        name: 'Track',
        component: () => import('@/views/machineTrack/track/index'),
        meta: { title: '轨迹跟踪管理' }
      }
    ]
  },

  {
    path: '/ai',
    component: Layout,
    meta: { title: 'AI预警管理', icon: 'ai-alarm', module: 'sanpo' },
    children: [
      {
        path: 'alarm',
        name: 'Alarm',
        component: () => import('@/views/aiAlarm/index'),
        meta: { title: 'AI预警管理' }
      }
    ]
  },

  {
    path: '/cameraMonitor',
    component: Layout,
    meta: { title: '视频监控管理', icon: 'camera-video', module: 'sanpo' },
    children: [
      {
        path: 'camera',
        name: 'Camera',
        component: () => import('@/views/cameraMonitor/cameraManage/index'),
        meta: { title: '摄像头信息' }
      },
      {
        path: 'video',
        name: 'Video',
        component: () => import('@/views/cameraMonitor/videoManage/index'),
        meta: { title: '视频管理' }
      }
    ]
  },

  // --------------------------  系统管理模块  --------------------------
  {
    path: '/sys',
    component: Layout,
    redirect: '/sys/user',
    name: 'System',
    meta: { title: '系统管理', icon: 'el-icon-setting', module: 'sys' },
    children: [
      {
        path: 'projectManage',
        name: 'ProjectManage',
        component: () => import('@/views/sys/projectManage/index'),
        meta: { title: '项目管理' }
      },
      {
        path: 'locationManage',
        name: 'LocationManage',
        component: () => import('@/views/sys/locationManage/index'),
        meta: { title: '道路管理' }
      },
      {
        path: 'evaluationUnitManage',
        name: 'EvaluationUnitManage',
        component: () => import('@/views/sys/evaluationUnitManage/index'),
        meta: { title: '评估单元管理' }
      },
      {
        path: 'inspectionTask',
        name: 'InspectionTask',
        component: () => import('@/views/sys/roadTaskManage/inspectionTask/index'),
        meta: { title: '巡检任务' }
      },
      {
        path: 'pavementAnalysis',
        name: 'PavementAnalysis',
        hidden: true,
        component: () => import('@/views/sys/roadTaskManage/pavementAnalysis/index'),
        meta: { title: '路面病害管理', activeMenu: '/sys/inspectionTask' }
      },
      {
        path: 'roadbedAnalysis',
        name: 'RoadbedAnalysis',
        hidden: true,
        component: () => import('@/views/sys/roadTaskManage/roadbedAnalysis/index'),
        meta: { title: '路基病害管理', activeMenu: '/sys/inspectionTask' }
      },
      {
        path: 'organization',
        name: 'Organization',
        component: () => import('@/views/sys/organization/index'),
        meta: { title: '组织管理' }
      },
      {
        path: 'role',
        name: 'Permission',
        component: () => import('@/views/sys/role/index'),
        meta: { title: '角色管理' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/sys/user/index'),
        meta: { title: '用户管理' }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/sys/menu/index'),
        meta: { title: '系统菜单' }
      },
      {
        path: 'dictionary',
        name: 'Dictionary',
        component: () => import('@/views/sys/dictionary/index'),
        meta: { title: '系统字典' }
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('@/views/sys/log/index'),
        meta: { title: '日志管理' }
      },
      {
        path: 'configManage',
        name: 'ConfigManage',
        component: () => import('@/views/sys/configManage/index'),
        meta: { title: '全局配置' }
      },
      {
        path: 'cacheManage',
        name: 'CacheManage',
        component: () => import('@/views/sys/cacheManage/index'),
        meta: { title: '缓存管理' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
