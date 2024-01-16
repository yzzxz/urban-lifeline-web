import request from '@/utils/request'

// 字典表列表，分页查询
export function getList(params) {
  return request({
    url: '/api/sys/v1/sys/sysDict/',
    method: 'get',
    params
  })
}
// 查询所有父节点，分页查询
export function getParentList(params) {
  return request({
    url: '/api/sys/v1/sys/sysDict/parentList',
    method: 'get',
    params
  })
}
// 根据父节点ID查询所有子节点，不分页
export function getChildrenList(params) {
  return request({
    url: '/api/sys/v1/sys/sysDict/childList',
    method: 'get',
    params
  })
}
export function addDict(params) {
  return request({
    url: '/api/sys/v1/sys/sysDict/',
    method: 'post',
    data: params
  })
}
export function editDict(params) {
  return request({
    url: '/api/sys/v1/sys/sysDict/',
    method: 'put',
    data: params
  })
}
// 逻辑删除字典表信息
export function delDict(id) {
  return request({
    url: `/api/sys/v1/sys/sysDict/${id}`,
    method: 'delete'
  })
}
