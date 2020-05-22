import request from '@/utils/request'

// 查询商品管理列表
export function listGoods(query) {
  return request({
    url: '/mall/goods/list',
    method: 'get',
    params: query
  })
}

// 查询商品管理详细
export function getGoods(goodsId) {
  return request({
    url: '/mall/goods/' + goodsId,
    method: 'get'
  })
}

// 新增商品管理
export function addGoods(data) {
  return request({
    url: '/mall/goods',
    method: 'post',
    data: data
  })
}

// 修改商品管理
export function updateGoods(data) {
  return request({
    url: '/mall/goods',
    method: 'put',
    data: data
  })
}

// 删除商品管理
export function delGoods(goodsId) {
  return request({
    url: '/mall/goods/' + goodsId,
    method: 'delete'
  })
}

// 导出商品管理
export function exportGoods(query) {
  return request({
    url: '/mall/goods/export',
    method: 'get',
    params: query
  })
}

// 商品状态修改
export function changeStatus(goodsIds, status) {
  return request({
    url: '/mall/goods/changeStatus/' + goodsIds + '/' + status,
    method: 'put'
  })
}
