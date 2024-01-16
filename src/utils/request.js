import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import router from '@/router'
// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 3 * 60 * 1000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    if (store.getters.token) {
      // let each request carry token
      // ['Access-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Access-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    if (response.status !== 200) {
      return handleErrorData(response)
    }

    const res = response.data
    if (res.code === 0) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })
    } else if (res.code === 1) {
      return res
    } else if (res.code === 2) {
      Message({
        message: res.data[0].errorMsg,
        type: 'error',
        duration: 5 * 1000
      })
    }
  },
  error => {
    if (error && error.response) {
      handleErrorData(error.response)
    } else {
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }
  }
)

/**
 * 统一处理请求错误信息
 * @param {Object} response 请求错误信息
 */
function handleErrorData(response) {
  if (response.message) {
    Message({
      message: response.message,
      type: 'error',
      duration: 5 * 1000
    })
  } else {
    switch (response.status) {
      case 401:
        Message.error('用户登录已失效，请重新登录!')
        // sessionStorage.clear()
        store.dispatch('user/resetToken').then(() => {
          // location.reload()
          router.replace('/login')
        })
        break
      case 403:
        Message.error('没有权限，拒绝访问!')
        break
      case 404:
        Message.error('很抱歉，资源未找到!')
        break
      case 500:
        Message.error('服务器错误!')
        break
      case 504:
        Message.error('网络超时!')
        break
      default:
        Message.error('服务正在联调中，请稍后!')
        break
    }
  }
}

export default service
