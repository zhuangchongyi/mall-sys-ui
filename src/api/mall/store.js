import request from '@/utils/request'

// 查询店铺列表
export function listStore(query) {
  return request({
    url: '/mall/store/list',
    method: 'get',
    params: query
  })
}

// 查询店铺详细
export function getStore(storeId) {
  return request({
    url: '/mall/store/' + storeId,
    method: 'get'
  })
}

// 新增店铺
export function addStore(data) {
  return request({
    url: '/mall/store',
    method: 'post',
    data: data
  })
}

// 修改店铺
export function updateStore(data) {
  return request({
    url: '/mall/store',
    method: 'put',
    data: data
  })
}

// 删除店铺
export function delStore(storeId) {
  return request({
    url: '/mall/store/' + storeId,
    method: 'delete'
  })
}

// 导出店铺
export function exportStore(query) {
  return request({
    url: '/mall/store/export',
    method: 'get',
    params: query
  })
}