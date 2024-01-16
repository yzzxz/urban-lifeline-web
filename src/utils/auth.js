import Cookies from 'js-cookie'

const TokenKey = 'access_token'

/**
 * 获取url参数
 * @param url 地址
 * @returns {{}}
 */
function getUrlParams(url) {
  const obj = {}
  const arr = url.split('?')
  if (arr && arr.length > 1) {
    const params = arr[1].split('&')
    for (let i = 0; i < params.length; i++) {
      const param = params[i].split('=')
      obj[param[0]] = param[1]
    }
  }
  return obj
}

export function getToken() {
  const urlParams = getUrlParams(window.location.href)
  const token = urlParams['token']
  // console.log(window.location.href, urlParams)
  if (token) {
    // console.log('set token')
    setToken(token)
  }
  return Cookies.get(TokenKey) || token
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
