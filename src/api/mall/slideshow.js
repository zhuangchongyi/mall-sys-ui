import request from '@/utils/request'

// 查询轮播图列表
export function listSlideshow(query) {
  return request({
    url: '/mall/slideshow/list',
    method: 'get',
    params: query
  })
}

// 查询轮播图详细
export function getSlideshow(slideshowId) {
  return request({
    url: '/mall/slideshow/' + slideshowId,
    method: 'get'
  })
}

// 新增轮播图
export function addSlideshow(data) {
  return request({
    url: '/mall/slideshow',
    method: 'post',
    data: data
    // headers: {
    //   'Content-Type': 'multipart/form-data'
    // }
  })
}

// 修改轮播图
export function updateSlideshow(data) {
  return request({
    url: '/mall/slideshow',
    method: 'put',
    data: data
  })
}

// 删除轮播图
export function delSlideshow(slideshowId) {
  return request({
    url: '/mall/slideshow/' + slideshowId,
    method: 'delete'
  })
}

// 修改轮播图状态
export function updateSlideshowStatus(data) {
  return request({
    url: '/mall/slideshow/status',
    method: 'put',
    data: data
  })
}
