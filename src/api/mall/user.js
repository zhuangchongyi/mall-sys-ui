import request from '@/utils/request'

// 查询会员用户列表
export function listUser(query) {
  return request({
    url: '/mall/user/list',
    method: 'get',
    params: query
  })
}

// 查询会员用户详细
export function getUser(userId) {
  return request({
    url: '/mall/user/' + userId,
    method: 'get'
  })
}

// 新增会员用户
export function addUser(data) {
  return request({
    url: '/mall/user',
    method: 'post',
    data: data
  })
}

// 修改会员用户
export function updateUser(data) {
  return request({
    url: '/mall/user',
    method: 'put',
    data: data
  })
}

// 删除会员用户
export function delUser(userId) {
  return request({
    url: '/mall/user/' + userId,
    method: 'delete'
  })
}

// 导出会员用户
export function exportUser(query) {
  return request({
    url: '/mall/user/export',
    method: 'get',
    params: query
  })
}