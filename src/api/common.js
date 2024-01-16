import request from '@/utils/request'

/**
 * 获取监测内容列表
 * @returns {*}
 */
export function getMonitoringItemList() {
  return request({
    url: `/api/sys/v1/sys/sysDict/dropDown/SCL_MONITORING_ITEM`,
    method: 'get'
  })
}

/**
 * 获取设备类型列表
 * @returns {*}
 */
export function getDeviceTypeList() {
  return request({
    url: `/api/sys/v1/sys/sysDict/dropDown/SCL_DEVICE_TYPE`,
    method: 'get'
  })
}
