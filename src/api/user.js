import request from '@/utils/request'

export function login(info) {
  return request({
    url: '/api/sys/v1/sso/encryLogin',
    method: 'post',
    data: {
      data: window.btoa(JSON.stringify(info))
    }
  })
}
export function smsLogin(data) {
  return request({
    url: '/api/sys/v1/sso/smsLogin',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/api/sys/v1/sso/logout',
    method: 'get'
  })
}

// 文件上传
export function uploadFile(data) {
  return request({
    url: '/api/sys/v1/oss/filerecord/folderFile',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

export function getCurrentUser(token) {
  return request({
    url: '/api/sys/v1/sys/sysUser/currentUser',
    method: 'get',
    params: { 'access-token': token }
  })
}

// 更改密码
export function changePwd(params) {
  return request({
    url: '/api/sys/v1/sys/sysUser/updatePassword',
    method: 'put',
    data: params
  })
}

// 更新当前用户信息
export function updateUserInfo(params) {
  return request({
    url: '/api/sys/v1/sys/sysUser/',
    method: 'put',
    data: params
  })
}

// 获取用户信息下拉选项
export function getUserDropDown() {
  return request({
    url: '/api/sys/v1/sys/sysUser/dropDownByOrg',
    method: 'get'
  })
}

// 注册
export function registerUser(data) {
  return request({
    url: '/api/sys/v1/sso/registerUser',
    method: 'post',
    data
  })
}
// 修改密码
export function changePassword(data) {
  return request({
    url: '/api/sys/v1/sso/resetPassword',
    method: 'post',
    data
  })
}
// 发送短信验证
export function sendSmsCode(phone) {
  return request({
    url: '/api/sys/v1/sso/sendSmsCode?phone=' + phone,
    method: 'put'
  })
}
