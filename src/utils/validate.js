/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

// 验证 大于 0的 数字
export function validNumberGt0(rule, value, callback) {
  const reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/

  if (value && !reg.test(value)) {
    callback(new Error('请输入大于等于0的数字'))
  } else {
    callback()
  }
}

function validateIPAddress(ip) {
  const pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return pattern.test(ip)
}
function validateDNSAddress(dns) {
  const pattern = /^(?:(?:[a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*(?:[a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/i
  return pattern.test(dns)
}

export function validIP(rule, value, callback) {
  if (value && !validateIPAddress(value)) {
    return callback(new Error('请输入正确格式的IP地址'))
  } else {
    callback()
  }
}

export function validDNS(rule, value, callback) {
  if (value && !validateDNSAddress(value)) {
    return callback(new Error('请输入正确格式的DNS地址'))
  } else {
    callback()
  }
}
