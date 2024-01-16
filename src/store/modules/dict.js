import request from '@/utils/request'

const state = {
  suzhouAddr: ['虎丘区', '吴中区', '相城区', '姑苏区', '吴江区', '常熟市', '张家港市', '昆山市', '太仓市'],
  // 摄像头功能函数列表
  funcList: [],
  // 项目列表
  projectList: [],
  // 位置列表
  positionList: [],
  // 监测内容列表
  monitoringItemList: [],
  // 设备类型列表
  deviceTypeList: [],
  // 路面病害类别
  pavementList: [],
  // 路基病害类别
  roadbedTypeList: [],
  // 时间粒度
  timeTypeList: [
    {
      label: '1min',
      value: 'MIN'
    },
    {
      label: '小时',
      value: 'HOUR'
    },
    {
      label: '日',
      value: 'DAY'
    }
    // {
    //   label: '月',
    //   value: 'MONTH'
    // },
    // {
    //   label: '年',
    //   value: 'YEAR'
    // }
  ],
  timeAllTypeList: [
    {
      label: '1min',
      value: 'MIN'
    },
    {
      label: '小时',
      value: 'HOUR'
    },
    {
      label: '日',
      value: 'DAY'
    },
    {
      label: '月',
      value: 'MONTH'
    },
    {
      label: '年',
      value: 'YEAR'
    }
  ],

  roadRiskLevel: {
    1: {
      name: '一级',
      label: 'Ⅰ',
      declare: '风险很低',
      advice: '日常养护'
    },
    2: {
      name: ' 二级',
      label: 'Ⅱ',
      declare: '风险较低',
      advice: '日常养护，定期巡视，可适时进行探测'
    },
    3: {
      name: '三级',
      label: 'Ⅲ',
      declare: '风险一般',
      advice: '按照每2年至少1次的频次进行探测'
    },
    4: {
      name: '四级',
      label: 'Ⅳ',
      declare: '风险较高',
      advice: '应在近期进行探测，按照每年至少1次的频次进行探测'
    },
    5: {
      name: '五级',
      label: 'Ⅴ',
      declare: '风险极高',
      advice: '应立即进行探测'
    }
  },

  // 道路类别
  roadTypeList: []
}
const mutations = {
  RESET_POSITION_LIST: (state, list) => {
    state.positionList = [...list]
  },
  RESET_MONITORING_ITEM_LIST: (state, list) => {
    state.monitoringItemList = [...list]
  },
  RESET_DEVICE_TYPE_LIST: (state, list) => {
    state.deviceTypeList = [...list]
  },
  RESET_PROJECT_LIST: (state, list) => {
    state.projectList = [...list]
  },
  RESET_FUNCLIST: (state, funcList) => {
    state.funcList = [...funcList]
  },
  RESET_PAVEMENT_TYPE_LIST: (state, list) => {
    state.pavementList = [...list]
  },
  RESET_ROADBED_TYPE_LIST: (state, list) => {
    state.roadbedTypeList = [...list]
  },
  RESET_ROAD_TYPE_LIST: (state, list) => {
    state.roadTypeList = [...list]
  }

}

const actions = {
  /**
   * 获取位置列表
   * @param commit
   * @returns {Promise<unknown>}
   */
  getPositionList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/scl/v1/scl/sclLocation/dropdown',
        method: 'get'
      }).then(res => {
        if (res?.code === 1 && res.data) {
          const list = Object.keys(res.data).map(key => {
            return {
              label: res.data[key],
              value: key
            }
          })
          commit('RESET_POSITION_LIST', list)
          resolve(res.data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * 获取项目列表
   * @param commit
   * @returns {Promise<unknown>}
   */
  getProjectList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/scl/v1/scl/sclProject/dropdown',
        method: 'get',
        params: {
          pageNum: -1,
          pageSize: -1
        }
      }).then(res => {
        if (res?.code === 1 && res.data) {
          const list = Object.keys(res.data).map(key => {
            return {
              label: res.data[key],
              value: key
            }
          })
          commit('RESET_PROJECT_LIST', list)
          resolve(res.data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * 获取监测内容列表
   * @param commit
   * @returns {Promise<unknown>}
   */
  getMonitoringItemList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/sys/v1/sys/sysDict/dropDown/SCL_MONITORING_ITEM',
        method: 'get'
      }).then(res => {
        if (res.code === 1) {
          let list = []
          if (res.data) {
            list = Object.keys(res.data).map(key => {
              return {
                label: res.data[key],
                value: key
              }
            })
          }
          commit('RESET_MONITORING_ITEM_LIST', list)
          resolve(res.data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * 获取设备类型列表
   * @param commit
   * @returns {Promise<unknown>}
   */
  getDeviceTypeList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/sys/v1/sys/sysDict/dropDown/SCL_DEVICE_TYPE',
        method: 'get'
      }).then(res => {
        if (res.code === 1) {
          let list = []
          if (res.data) {
            list = Object.keys(res.data).map(key => {
              return {
                label: res.data[key],
                value: key
              }
            })
          }
          commit('RESET_DEVICE_TYPE_LIST', list)
          resolve(res.data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * 获取摄像头功能列表
   * @param commit
   * @returns {Promise<unknown>}
   */
  getFuncList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/sys/v1/sys/sysDict/dropDown/FUNC_TYPE',
        method: 'get'
      })
        .then((res) => {
          const funcList = []
          Object.keys(res.data).map((key) => {
            funcList.push({
              label: res.data[key],
              value: key
            })
          })
          commit('RESET_FUNCLIST', funcList)
          resolve(res.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  /**
  * 获取路面病害类别
  * @param commit
  * @returns {Promise<unknown>}
  */
  getPavementList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/sys/v1/sys/sysDict/dropDown/SCL_PAVEMENT_TYPT',
        method: 'get'
      }).then(res => {
        if (res.code === 1) {
          let list = []
          if (res.data) {
            list = Object.keys(res.data).map(key => {
              return {
                label: res.data[key],
                value: key
              }
            })
          }
          commit('RESET_PAVEMENT_TYPE_LIST', list)
          resolve(res.data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  /**
  * 获取路基病害类别
  * @param commit
  * @returns {Promise<unknown>}
  */
  getRoadbedTypeList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/sys/v1/sys/sysDict/dropDown/SCL_ROADBED_TYPE_LIST',
        method: 'get'
      }).then(res => {
        if (res.code === 1) {
          let list = []
          if (res.data) {
            list = Object.keys(res.data).map(key => {
              return {
                label: res.data[key],
                value: key
              }
            })
          }
          commit('RESET_ROADBED_TYPE_LIST', list)
          resolve(res.data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
  * 获取道路类型列表
  * @param commit
  * @returns {Promise<unknown>}
  */
  getRoadTypeList({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/sys/v1/sys/sysDict/dropDown/SCL_ROAD_TYPE',
        method: 'get'
      }).then(res => {
        if (res.code === 1) {
          let list = []
          if (res.data) {
            list = Object.keys(res.data).map(key => {
              return {
                label: res.data[key],
                value: key
              }
            })
          }
          commit('RESET_ROAD_TYPE_LIST', list)
          resolve(res.data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
