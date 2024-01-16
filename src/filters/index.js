import dayjs from 'dayjs'
import { getFilePath } from '@/utils'

export const imageUrlFilter = (path) => {
  return getFilePath(path)
}

// 日期格式化
export const dateFilter = (val) => {
  return val ? dayjs(val).format('YYYY-MM-DD') : ''
}

export const dateTimeFilter = (val) => {
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
}

// 是、否
export const whetherOrNotFilter = (val) => {
  const res = Number(val)
  return res === 1 ? '是' : res === 0 ? '否' : val
}
// 男女
export const sexFilter = (val) => {
  const res = Number(val)
  return res === 2 ? '女' : res === 1 ? '男' : val
}

export const inOutFilter = (val) => {
  const res = Number(val)
  return res === 2 ? '出场' : res === 1 ? '进场' : val
}

export const warningLevelFilter = (val) => {
  const arr = ['一级预警', '二级预警', '三级预警']
  return arr[val - 1] || ''
}

