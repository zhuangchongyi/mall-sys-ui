import request from '@/utils/request'


/* 商品图片查询列表 */
export function listGoodsImage(goodsId) {
  return request({
    url: '/mall/image/list/' + goodsId,
    method: 'get'
  })
}


/* 商品图片上传 */
export function uploadGoodsImage(data) {
  return request({
    url: '/mall/image/uploadGoodsImage',
    method: 'post',
    data
  })
}

/* 商品图片删除 */
export function deleteGoodsImage(data) {
  return request({
    url: '/mall/image/deleteGoodsImage',
    method: 'delete',
    params: data
  })
}
